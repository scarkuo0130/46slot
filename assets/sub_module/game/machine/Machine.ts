import { _decorator, Component, find, Mask, EventTarget, Graphics } from 'cc';
import { AutoSpin } from '../AutoSpin';
import { Controller } from './controller_folder/Controller';
import { gameInformation } from '../GameInformation';
import { DataManager } from '../../data/DataManager';
import { DialogUI } from '../DialogUI';
import { Reel } from './Reel';
import { StateManager } from '../StateManager';
import { slotData } from '../SlotData';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { Paytable } from './pay/PayTable';
import { Viewport } from '../../utils/Viewport';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('Machine')
export class Machine extends Component {
    public static readonly SPEED_MODE = { NORMAL: 0, TURBO: 2, QUICK: 1, DEFAULT:1, MAX:2 };

    public static readonly SPIN_STATE = { 
        IDLE          : 0,      // 閒置中
        PERFORM_SCORE : 1,      // 閒置中, 輪流顯示分數
        SPINNING      : 2,      // SPIN中
        STOPPING      : 3,      // 停止中
    };

    // 是否正在SPIN
    public get spinning() { return this.properties.spinState > Machine.SPIN_STATE.PERFORM_SCORE; }

    // 是否忙碌中
    public get isBusy() : boolean { return this.properties.spinState > Machine.SPIN_STATE.IDLE; }
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
    public static SetReel(reel) { Machine.Instance.reel = reel; }

    protected properties = {
        'reel' : null,
        'paytable' : null,
        'bigwin' : null,
        'controller' : null,
        'speedMode' : Machine.SPEED_MODE.DEFAULT,
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
        cc.machine = this;
        cc.DataManager = DataManager.instance;
        cc.slotData = slotData;
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
    }


    public get userCredit() { return DataManager.instance.userData.credit; }

    public get totalBet() { return this.controller.totalBet; }

    /**
     * Machine SPIN
     * 玩家點擊 Spin 通知 Paytable SPIN
     * 負責判斷 AutoSpin 是否繼續或停止
     */
    public async spin() {
        // 通知 reel 執行 SPIN
        await this.paytable.spin(); // 等待 SPIN 結束, 包含獎項顯示, BigWin 處理等...
        // 回到 Controller clickSpin function
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

        // 扣除金額
        userCredit -= betCredit;
        this.controller.changeBalance(userCredit);
        this.spinCommand(); // 向 Server 發送 SPIN 指令
        // SPIN
        await this.spin();
    }

    // 向 Server 發送SPIN指令
    public async spinCommand (): Promise<any> { 
        let event = this.properties['spinEvent'];

        event.removeAll('done');
        event['result'] = null;
        StateManager.instance.sendSpinCommand();
        await Utils.delayEvent(event); // 等待 Server 回應

        // 通知 paytable 本局結果
        this.paytable.spinResult(event['result']);
    }

    // Server 回應 SPIN
    public spinResponse ( spinData: any ) {
        let event = this.properties['spinEvent'];
        event['result'] = spinData;
        this.properties['spinData'] = spinData;
        event.emit('done');
    }

}