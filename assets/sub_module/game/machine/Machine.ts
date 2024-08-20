import { _decorator, Component, find, Mask, EventTarget, Graphics, Button, Color, screen } from 'cc';
import { AutoSpin } from '../AutoSpin';
import { Controller } from './controller_folder/Controller';
import { gameInformation } from '../GameInformation';
import { DataManager } from '../../data/DataManager';
import { DialogUI } from '../DialogUI';
import { Reel, SPIN_MODE } from './Reel';
import { StateManager } from '../StateManager';
import { slotData } from '../SlotData';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { Paytable } from './pay/PayTable';
import { Viewport } from '../../utils/Viewport';
import { BigWin } from './BigWin';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('Machine')
export class Machine extends Component {
    public get isFullScreen() { return screen.fullScreen(); }

    public fullscreen(active:boolean) {
        if ( active === true ) return screen.requestFullScreen();
        return screen.exitFullScreen();
    }

    public static readonly SPIN_MODE = SPIN_MODE;

    public static readonly SPEED_MODE = { NORMAL: 0, TURBO: 2, QUICK: 1, DEFAULT:1, MAX:2 };

    public static readonly SPIN_STATE = { 
        PRELOAD       : -1,     // 預載中
        IDLE          : 0,      // 閒置中
        PERFORM_SCORE : 1,      // 閒置中, 輪流顯示分數
        SPINNING      : 2,      // SPIN中
        STOPPING      : 3,      // 停止中
    };

    // 是否正在SPIN
    public get spinning() { return this.properties.spinState > Machine.SPIN_STATE.PERFORM_SCORE; }

    // 是否忙碌中
    public get isBusy() : boolean { 
        if ( this.featureGame === true ) return true;
        if ( AutoSpin.isActive() === true ) return true;
        return this.spinning;
    }
    public set state(value:number) { this.properties.spinState = value; }
    public get state() { return this.properties.spinState; }

    // 是否正在快速停止
    public get fastStopping() { return this.properties.fastStopping; }
    public set fastStopping(value:boolean) { this.properties.fastStopping = value; }

    // 是否在特色遊戲
    public get featureGame() { return this.properties.featureGame; }
    public set featureGame(value:boolean) { this.properties.featureGame = value; }

    public get reel() : Reel { return this.properties.reel; }
    public set reel(value) { this.properties.reel = value; }

    public get bigwin() :BigWin { return BigWin.Instance; }
    public static SetReel(reel) { Machine.Instance.reel = reel; }
    public get spinEvent() : EventTarget { return this.properties.spinEvent; }

    public clearSpinEvent() : EventTarget {
        let spinEvent = this.spinEvent;
        if ( spinEvent == null ) {
            this.properties['spinEvent'] = new EventTarget();
            return this.spinEvent;
        }

        spinEvent.removeAll('done');
        spinEvent['result'] = null;
        spinEvent['spinning'] = false;
        spinEvent['buy'] = null;
        return spinEvent;
    }

    public set buyFeatureGameButton(button:Button) { 
        if ( button == null ) return;
        this.properties['buyFeatureGameButton'] = button; 
        this.controller.addDisableButtons(button);
        Utils.AddHandHoverEvent(button.node);
    }
    public get buyFeatureGameButton() { return this.properties['buyFeatureGameButton']; }

    public activeBuyFGButton(active:boolean) {
        if ( this.buyFeatureGameButton == null ) return;
        this.buyFeatureGameButton.interactable = active;
        Utils.changeMainColor(this.buyFeatureGameButton.node, active ? Color.WHITE : Color.GRAY);
    }

    protected properties = {
        'reel' : null,
        'paytable' : null,
        'bigwin' : null,
        'controller' : null,
        'speedMode' : Machine.SPIN_MODE.QUICK,
        'spinState' : Machine.SPIN_STATE.IDLE,
        'fastStopping' : false,
        'featureGame' : false,
        'spinEvent' : null,
        'spinData' : null,

    };

    public setSpeedMode(mode:number) {
        this.properties['speedMode'] = mode;
        AutoSpin.ChangeSpeedMode(mode);
        return mode;
    }

    public get SpeedMode() { return this.properties['speedMode']; }

    public get controller() : Controller { return Controller.Instance; }

    public get paytable() : Paytable { return this.properties['paytable']; }
    public set paytable(value) { this.properties['paytable'] = value; }

    public get spinData() { return this.properties['spinData']; }
    
    public static Instance: Machine = null;
    protected onLoad(): void {
        Machine.Instance = this;
        slotData.machine = this;
        this.properties['spinEvent'] = new EventTarget();
        this.developTest();
    }

    @isDevelopFunction(true)
    private developTest() {
        // if ( Utils.isDevelopment() === false ) return;
        cc.machine = this;
        cc.DataManager = DataManager.instance;
        cc.slotData = slotData;
        cc.gameInformation = gameInformation;
    }

    protected start() {
        this.properties['controller'] = Controller.Instance;
        Viewport.lockResizeHandler();
        const mask = find('Canvas')?.getComponent(Mask);
        if ( mask ) {
            mask.enabled = true;
            mask.node.getComponent(Graphics).enabled = true;
    }   }

    public startAutoSpin() {
        console.log('startAutoSpin');
    }

    public static EnterGame() { Machine.Instance.enterGame(); }
    public enterGame() {
        console.log('enterGame', gameInformation, DataManager.instance);
        console.log(this.controller);
        this.controller.refreshBalance();
        this.controller.setTotalWin(0);
        this.controller.betIdx = gameInformation._coinValueDefaultIndex;
        this.controller.refreshTotalBet();
        this.paytable.changeTotalBet(this.totalBet);
        this.paytable.enterGame();
    }


    public get userCredit() { return DataManager.instance.userData.credit; }

    public get totalBet() { return this.controller.totalBet; }

    /**
     * Machine SPIN
     * 玩家點擊 Spin 通知 Paytable SPIN
     * 負責判斷 AutoSpin 是否繼續或停止
     */
    public async spin() {
        // 關閉所有按鈕
        this.controller.clickOptionBack();
        this.controller.activeBusyButtons(false);
        this.controller.buttonSpinning();

        // 通知 reel 執行 SPIN
        await this.paytable.spin(); // 等待 SPIN 結束, 包含獎項顯示, BigWin 處理等...

        // 啟用所有按鈕
        this.controller.buttonSpinning(false);
        console.log('spin end', AutoSpin.isActive());
        if ( AutoSpin.isActive() !== true ) this.controller.activeBusyButtons(true);

        if (this.featureGame !== true ) this.controller.refreshBalance(); // 更新餘額
        this.fastStopping = false;
        return; // 回到 Controller clickSpin function
        
    }

    // 從Controller呼叫
    public async clickSpin() {

        // 檢查是否有足夠的金額
        let betCredit = this.totalBet;
        let userCredit = this.userCredit;
        if (userCredit < betCredit) {
            DialogUI.OpenUI('Insufficient balance', true, 'Insufficient balance', null, 'OK');
            return false;
        }

        Utils.delay(100).then(()=>{
            // 扣除金額
            userCredit -= betCredit;
            this.controller.changeBalance(userCredit);
        });

        this.spinCommand(); // 向 Server 發送 SPIN 指令
        // SPIN
        await this.spin();
    }

    public async buyFeatureGame(idx:number) : Promise<boolean> {
        let event = this.spinEvent;
        let buyEvent : EventTarget = this.properties['buyEvent'];

        if ( this.isBusy ) return false;
        if ( event?.['spinning'] ) return false;
        if ( buyEvent?.['spinning'] ) return false;

        let multiplier = gameInformation.buyInformation.multiplier;
        let baseTotalBet = this.controller.calculateTotalBet(idx);
        let totalBet = baseTotalBet * multiplier;
        let userCredit = this.userCredit;
        
        if ( userCredit < totalBet ) {
            DialogUI.OpenUI('Insufficient balance', true, 'Insufficient balance', null, 'OK');
            return false;
        }

        if ( buyEvent == null ) {
            this.properties['buyEvent'] = new EventTarget();
            buyEvent = this.properties['buyEvent'];
        } else {
            buyEvent.removeAll('done');
        }

        userCredit -= totalBet;
        this.controller.changeBalance(userCredit);
        this.spin();
        await this.spinCommand(baseTotalBet);
        buyEvent.emit('done');
        event['buy'] = {
            'totalBet' : totalBet,
            'idx' : idx,
        };

        return true;
    }

    public isDevelop() : boolean { return Utils.isDevelopment(); }

    // 向 Server 發送SPIN指令
    public async spinCommand (buyTotalBet:number=0): Promise<any> { 
        let event = this.clearSpinEvent();

        if ( buyTotalBet === 0 ) {
            StateManager.instance.sendSpinCommand();
        } else {
            StateManager.instance.sendBuySpinCommand(buyTotalBet);
        }

        await Utils.delayEvent(event); // 等待 Server 回應
        event['spinning'] = false;

        // 通知 paytable 本局結果
        this.paytable.spinResult(event['result']);
    }

    // Server 回應 SPIN
    public spinResponse ( spinData: any ) {
        let event = this.spinEvent;
        event['result'] = spinData;
        this.properties['spinData'] = spinData;
        DataManager.instance.userData.credit = spinData.user_credit;
        event.emit('done');
    }

    public eventChangeTotalBet() {
        this.paytable?.changeTotalBet(this.totalBet);
    }

    @isDevelopFunction(true)
    public spinTest(spinData:any) {
        let event = this.spinEvent;

        event.removeAll('done');
        event['result'] = null;
        this.spin();
        this.spinResponse(spinData);
        this.paytable.spinResult(spinData);
    }
}