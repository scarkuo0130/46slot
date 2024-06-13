import { _decorator, Component, EventHandler, EventTarget } from 'cc';
import { AutoSpin } from '../AutoSpin';
import { Controller2_0 } from './controller_folder/Controller2.0';
import { gameInformation } from '../GameInformation';
import { UserData } from '../../data/UserData';
import { DataManager } from '../../data/DataManager';
import { DialogUI } from '../DialogUI';
import { Reel } from './Reel';
import { StateManager } from '../StateManager';
import { slotData } from '../SlotData';
import { Utils } from '../../utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('Machine2_0')
export class Machine2_0 extends Component {
    public static readonly SPEED_MODE = { NORMAL: 0, TURBO: 2, QUICK: 1, DEFAULT:1, MAX:2 };

    public static readonly SPIN_STATE = { 
        IDLE:0,           // 閒置中
        PERFORM_SCORE: 1, // 閒置中, 輪流顯示分數
        SPINNING: 2,      // SPIN中
        STOPPING: 3,      // 停止中
    };

    // 是否正在SPIN
    public get spinning() { return this.properties.spinState >= Machine2_0.SPIN_STATE.SPINNING; }
    public set spin_state(value:number) { this.properties.spinState = value; }

    // 是否正在快速停止
    public get fastStopping() { return this.properties.fastStopping; }
    public set fastStopping(value:boolean) { this.properties.fastStopping = value; }

    // 是否在特色遊戲
    public get featureGame() { return this.properties.featureGame; }
    public set featureGame(value:boolean) { this.properties.featureGame = value; }

    public get reel() : Reel { return this.properties.reel; }
    public set reel(value) { this.properties.reel = value; }
    public static SetReel(reel) { Machine2_0.Instance.reel = reel; }

    protected properties = {
        'reel' : null,
        'paytable' : null,
        'bigwin' : null,
        'controller' : null,
        'speedMode' : Machine2_0.SPEED_MODE.DEFAULT,
        'spinState' : Machine2_0.SPIN_STATE.IDLE,
        'fastStopping' : false,
        'featureGame' : false,
        'spinEvent' : null,

    };

    public setSpeedMode(mode:number) {
        this.properties['speedMode'] = mode;
        AutoSpin.ChangeSpeedMode(mode);
        return mode;
    }

    public get SpeedMode() { return this.properties['speedMode']; }

    public get controller() : Controller2_0 { return this.properties['controller']; }
    
    public static Instance: Machine2_0 = null;
    protected onLoad(): void {
        Machine2_0.Instance = this;
        let callSpinData = new EventHandler();
        callSpinData.target = this.node;
        callSpinData.component = 'Machine2_0';
        callSpinData.handler = 'spinResponse';
        slotData.spinResponseEventHandler = callSpinData;

        this.properties['spinEvent'] = new EventTarget();
    }

    protected start() {
        this.properties['controller'] = Controller2_0.Instance;
    }

    public startAutoSpin() {
        console.log('startAutoSpin');
    }

    public static EnterGame() { Machine2_0.Instance.enterGame(); }
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

    public async Spin() {


        // 通知 reel 執行 SPIN
        this.spin_state = Machine2_0.SPIN_STATE.SPINNING;
        await this.reel.Spin(); // 等待 SPIN 結束
        this.spin_state = Machine2_0.SPIN_STATE.STOPPING;

        // 結算
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
        this.spinCommand();
        // SPIN
        await this.Spin();
    }

    // 向 Server 發送SPIN指令
    public async spinCommand (): Promise<any> { 
        let event = this.properties['spinEvent'];

        event.removeAll('done');
        event['result'] = null;
        StateManager.instance.sendSpinCommand();
        await Utils.delayEvent(event);
        return event['result'];
    }

    // Server 回應 SPIN
    public spinResponse ( spinData: any ) {
        console.log('spinResponse', spinData);
        let event = this.properties['spinEvent'];
        event['result'] = spinData;
        event.emit('done');
    }

}