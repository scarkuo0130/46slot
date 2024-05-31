import { _decorator, CCFloat, CCInteger, Component, EventHandler, Node, CCBoolean } from 'cc';
import { Wheel, WHEEL_STATE } from './Wheel';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { Machine, MACHINE_STATUS } from './Machine';
import { Symbol } from './Symbol';
import { TEST } from 'cc/env';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

export enum REEL_STATE {
    NORMAL_STATE = 0,
    SPINING_STATE = 1,
    STOPING_STATE = 2,
    WIN_STATE = 3,
}

export enum SPIN_MODE {
    NORMAL_MODE = 0,
    QUICK_MODE = 1,
    TURBO_MODE = 2,
}

export const SPIN_MODE_DATA = [ SPIN_MODE.NORMAL_MODE, SPIN_MODE.QUICK_MODE, SPIN_MODE.TURBO_MODE ];

@ccclass('StartRollingSetting')
export class StartRollingSetting {
    @property({ displayName: '是否各別設定啟動滾輪時間', tooltip: '是否設定啟動時間' })
    public isCustomStartTime = false;

    @property( { type: [ CCInteger ], displayName: 'Normal', tooltip: 'Normal 啟動時間', visible: function () { return this.isCustomStartTime },  } )
    public customStartTime_n = [];
}

@ccclass( 'ReelInscept' )
/**
 * Reel 元件設定
 */
export class ReelInscept {
    // ------------------- 以下是舊設定 -------------------
    @property( { type: Node, displayName: 'WheelsContainer', tooltip: '滾輪Container', group: { name: 'WheelsContainer', id: '0' } } )
    public wheelsContainer: Node;

    @property( { type: CCFloat, displayName: 'Normal SpinTime', tooltip: 'Normal Spin 時間', step: 0.1, min: 0.1, max: 10, group: { name: 'Normal', id: '1' } } )
    public normalSpinTime: number = 2;

    @property( { type: CCFloat, displayName: 'SpinStartInterval', tooltip: '啟動間隔', step: 0.01, min: 0, max: 1, group: { name: 'Normal', id: '1' } } )
    public spinTimeStartInterval_n = 0;

    @property( { type: CCFloat, displayName: 'SpinStopInterval', tooltip: '停輪間隔', step: 0.1, min: 0, max: 2, group: { name: 'Normal', id: '1' } } )
    public spinTimeStopInterval_n = 0.1;

    @property( { type: CCFloat, displayName: 'Quick SpinTime', tooltip: 'Quick Spin 時間', step: 0.1, min: 0.1, max: 10, group: { name: 'Quick', id: '1' } } )
    public quickSpinTime: number = 1;

    @property( { type: CCFloat, displayName: 'SpinStartInterval', tooltip: '啟動間隔', step: 0.01, min: 0, max: 1, group: { name: 'Quick', id: '1' } } )
    public spinTimeStartInterval_q = 0;

    @property( { type: CCFloat, displayName: 'SpinStopInterval', tooltip: '停輪間隔', step: 0.1, min: 0, max: 2, group: { name: 'Quick', id: '1' } } )
    public spinTimeStopInterval_q = 0.1;

    @property( { type: CCFloat, displayName: 'Turbo SpinTime', tooltip: 'turbo Spin 時間', step: 0.1, min: 0.1, max: 10, group: { name: 'Turbo', id: '1' } } )
    public turboSpinTime: number = 0.1;
    @property( { type: CCFloat, displayName: 'SpinStartInterval', tooltip: '啟動間隔', step: 0.01, min: 0, max: 1, group: { name: 'Turbo', id: '1' } } )
    public spinTimeStartInterval_t = 0;

    @property( { type: CCFloat, displayName: 'SpinStopInterval', tooltip: '停輪間隔', step: 0.1, min: 0, max: 2, group: { name: 'Turbo', id: '1' } } )
    public spinTimeStopInterval_t = 0.1;

    @property( { displayName: 'StopWheelNotOrderByIndex', tooltip: '不依照順序停輪', group: { name: 'StopWheelOrder', id: '2' } } )
    public stopWheelNotOrderByIndex = false;

    @property( { type: [ CCInteger ], displayName: 'orderStopWheel', tooltip: '停輪順序', visible: function () { return this.stopWheelNotOrderByIndex === true; }, group: { name: 'StopWheelOrder', id: '2' } } )
    public orderStopWheel = [];

    public wheels: Wheel[] = [];
}

@ccclass( 'Reel_bak' )
@disallowMultiple( true )
@menu( 'SlotMachine/Reel/Reel' )
@help( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.8by41ss5h81o' )
/**
 * 滾輪帶
 * 控制 Wheel 滾輪狀態
 * 決定播放Line or way 功能
 */
export class Reel_bak extends Component {
    @property({ type: Boolean, displayName: '啟動滾輪設定', tooltip: '啟動滾輪設定', group: { name: '啟動設定', id: '0' }})
    public StartRollingSetting: StartRollingSetting = new StartRollingSetting();




    @property( { type: ReelInscept, displayName: 'Setting', tooltip: '輪盤設定' } )
    public reelSetting: ReelInscept = new ReelInscept();

    /** 輪帶結果 */
    protected result: number[][] = null;

    /** 是否正在快停狀態 */
    private isFastStoping: boolean = false;
    /**
     * 獲得 Spin 結果
     * @param result number[][] 輪帶資料
     */

    /** 啟動輪軸間隔設定 對應速度模式 */
    private _spinTimeStartInterval;
    protected get spinTimeStartInterval () { return this._spinTimeStartInterval[ this.getSpinMode() ]; }

    /** 停止輪軸間隔設定 對應速度模式 */
    private _spinTimeStopInterval;
    protected get spinTimeStopInterval () { return this._spinTimeStopInterval[ this.getSpinMode() ]; }

    private spinTimeByMode = {};
    private spinSpeedMode: SPIN_MODE = SPIN_MODE.QUICK_MODE;
    public setSpinMode ( mode: SPIN_MODE ): SPIN_MODE { return this.spinSpeedMode = mode; }
    public getSpinMode (): SPIN_MODE {
        return this.spinSpeedMode;
    }

    public get spinTime () {  return this.spinTimeByMode[ this.spinSpeedMode ];  }

    /**
     * 給予盤面結果
     * @param result: number[][] 
     */
    public setResult ( result: number[][] ) { this.result = result; }
    protected machine: Machine = null;
    public setMachine ( machine: Machine ) { this.machine = machine; }
    public get getMachine () { return this.machine; }

    //#region STATE
    private state: REEL_STATE = REEL_STATE.NORMAL_STATE;
    public changeState ( state: REEL_STATE ) { this.state = state; }
    public getState () { return this.state; }
    //#endregion

    public spinHandler: EventHandler;

    private allWheelRolling: boolean = false;

    protected stopWheelIdx: number[] = [];

    /**
     * 檢查 Inscept 資料
     * @returns 
     */
    protected checkInscept (): boolean {
        if ( this.reelSetting.wheelsContainer == null ) {
            console.error( `Reel ${ this.node[ ' INFO ' ] } 沒有設定 WheelContainer`, this.node );
            return false;
        }

        return true;
    }



    onLoad () {
        if ( this.checkInscept() === false ) return;

        if ( this.reelSetting.wheelsContainer != null ) {
            let wheels = this.reelSetting.wheelsContainer.getComponentsInChildren<Wheel>( Wheel );
            this.reelSetting.wheels = wheels;
        }

        this.spinTimeByMode = {};
        this.spinTimeByMode[ SPIN_MODE.NORMAL_MODE ] = this.reelSetting.normalSpinTime * 1000;
        this.spinTimeByMode[ SPIN_MODE.QUICK_MODE ] = this.reelSetting.quickSpinTime * 1000;
        this.spinTimeByMode[ SPIN_MODE.TURBO_MODE ] = this.reelSetting.turboSpinTime * 1000;

        this._spinTimeStartInterval = {};
        this._spinTimeStartInterval[ SPIN_MODE.NORMAL_MODE ] = this.reelSetting.spinTimeStartInterval_n * 1000;
        this._spinTimeStartInterval[ SPIN_MODE.QUICK_MODE ] = this.reelSetting.spinTimeStartInterval_q * 1000;
        this._spinTimeStartInterval[ SPIN_MODE.TURBO_MODE ] = this.reelSetting.spinTimeStartInterval_t * 1000;

        this._spinTimeStopInterval = {};
        this._spinTimeStopInterval[ SPIN_MODE.NORMAL_MODE ] = this.reelSetting.spinTimeStopInterval_n * 1000;
        this._spinTimeStopInterval[ SPIN_MODE.QUICK_MODE ] = this.reelSetting.spinTimeStopInterval_q * 1000;
        this._spinTimeStopInterval[ SPIN_MODE.TURBO_MODE ] = this.reelSetting.spinTimeStopInterval_t * 1000;
        console.log(this._spinTimeStopInterval);

        let wheels = this.getWheels();
        for ( let i = 0; i < wheels.length; i++ ) {
            wheels[ i ].setReel( i, this );
        }

        if ( this.reelSetting.stopWheelNotOrderByIndex === false ) {
            this.stopWheelIdx = [];
            for ( let i = 0; i < wheels.length; i++ ) {
                this.stopWheelIdx.push( i );
            }
        } else {
            this.stopWheelIdx = this.reelSetting.orderStopWheel;
            for ( let i = 0; i < wheels.length; i++ ) {
                if ( this.stopWheelIdx.includes( i ) === true ) continue;
                this.stopWheelIdx.push( i );
            }
        }

        let handler = new EventHandler();
        handler.target = this.node;
        handler.component = 'Reel';
        handler.handler = 'stopSpin';
        handler.customEventData = '';
        this.spinHandler = handler;

        this.developTest();
    }

    @isDevelopFunction( true )
    /**
     * 測試Spin專用
     */
    public developTest () {
        cc.reel = {};
        cc.reel[ this.node.uuid ] = this;
        console.log( cc.reel );
    }

    /**
     * 滾輪帶
     */
    public getWheels (): Wheel[] { return this.reelSetting.wheels; }

    /** Spin 控制 */
    public async Spin () {
        this.isFastStoping = false;
        this.allWheelRolling = false;
        this.changeState( REEL_STATE.SPINING_STATE );
        let startInterval = this.spinTimeStartInterval;

        for ( let i in this.reelSetting.wheels ) {
            let wheel = this.reelSetting.wheels[ i ];
            if ( startInterval > 0 ) await Utils.delay( startInterval );

            /// 有可能在 startInterval 間隔中按快停
            wheel.Spin();
        }

        console.log('spin time:', this.spinTime);
        Utils.delayHandler( 'stopSpin', this.spinTime, this.spinHandler );
    }

    /** 
     * 快速停輪
     */
    public fastStopSpin () {
        if ( this.isFastStoping === true ) return;
        this.isFastStoping = true;

        if ( this.allWheelRolling === false ) return;
        this.stopSpin();
    }

    /**
     * Wheel 開始轉動
     * @param wheelID 
     */
    public startRolling ( wheelID ) {
        if ( wheelID != this.getWheels().length - 1 ) return;
        this.allWheelRolling = true;

        if ( this.isFastStoping === false ) return;
        this.stopSpin();
    }

    /**
     * 自然停輪
     * @from Spin()
     */
    protected async stopSpin () {
        Utils.removeDelay( 'stopSpin' );
        if ( this.getState() !== REEL_STATE.SPINING_STATE ) return;

        /// 沒有拿到答案, 再轉一下
        if ( this.result === null ) {
            return Utils.delayHandler( 'stopSpin', this.spinTime, this.spinHandler );
        }

        this.changeState( REEL_STATE.STOPING_STATE );
        let delay = this.spinTimeStopInterval;
        if ( this.isFastStoping == true ) delay = 0;

        let nearIdx = this.getNearIdx();

        this.stopWheels( delay, nearIdx );
        this.changeState( REEL_STATE.NORMAL_STATE );
        return;
    }

    protected getNearIdx () {
        let scatterInfo = this.getMachine?.scatterInfo;
        let nearIdx = 999;

        if ( scatterInfo == null ) return nearIdx;
        let scatters: number[] = scatterInfo[ 'id' ];
        let result: number[][] = this.result;

        for ( let i in scatters ) {
            let count = 0;
            let chkSym = scatters[ i ];
            for ( let j = 0; j < result.length; j++ ) {
                if ( result[ j ].includes( chkSym, 0 ) == false ) continue;
                count++;

                if ( count == 2 ) {
                    if ( j < nearIdx ) nearIdx = j;
                    break;
                }
            }
        }

        return nearIdx;
    }

    /**
     * 是否要針對 wheelIdx 滾輪做聽牌效果
     * @param wheelIdx 
     * @param baseNearIDx 
     * @returns 
     */
    public isNearWheels ( wheelIdx: number, baseNearIDx: number ): boolean {

        /// 看 machine 有沒有特殊規則
        let getMachineCheck = this.getMachine?.isNearWheels( wheelIdx, baseNearIDx );

        /// machine 有特殊規則
        if ( getMachineCheck != null ) return getMachineCheck;

        return wheelIdx > baseNearIDx;
    }

    protected async stopOneWheel ( wheelIdx: number, nearIdx: number, delaySec: number = 0, isTurbo: boolean = false ) {
        let wheels = this.getWheels();
        let result = this.result;

        let wheel = wheels[ wheelIdx ];
        // let res = [ result[ wheelIdx ].slice( 0 ) ][0];
        let res = result[ wheelIdx ];
        let isNear: boolean = this.isNearWheels( wheelIdx, nearIdx );

        if ( isNear ) { // 聽牌停輪
            wheel.stopRolling( res );   // 通知滾輪做聽牌效果

            // 等滾輪表演完
            while ( ( wheel.state != WHEEL_STATE.STATE_NORMAL ) ) await Utils.delay( 100 );

        } else { // 一般停輪

            /// 還沒開始轉就收到停輪指令, 因為使用者連點 spin
            // while((wheel.state != WHEEL_STATE.STATE_ROLLING) ) await Utils.delay(100);
            if ( this.allWheelRolling === false ) await Utils.delay( 100 );
            wheel.stopRolling( res );

            /// 停兩輪的時候，使用者可能中途按快停, 產生時間差, 所以三個判斷不能省
            if ( this.isFastStoping === true || isTurbo === true || delaySec === 0 ) return;

            await Utils.delay( delaySec );
        }
    }

    /** 執行停輪
     * @param [delaySec=0] 停輪間隔時間
     * @param [nearIdx=-1] 第幾輪開始聽牌, -1表示沒有
     */
    public async stopWheels ( delaySec: number = 0, nearIdx = 999 ) {
        let isTurbo: boolean = false;
        if ( this.getSpinMode() === SPIN_MODE.TURBO_MODE ) isTurbo = true;

        for ( let i = 0; i < this.stopWheelIdx.length; i++ ) {
            let idx = this.stopWheelIdx[ i ];
            await this.stopOneWheel( idx, nearIdx, delaySec, isTurbo );
        }

        // 清除這一次的結果
        this.result = null;
    }

    /**
     * 設定停輪
     * @param wheelIndex 滾輪位置 
     */
    public async setStopWheel ( wheelIndex: number ) {
        this.getMachine?.stopWheel( wheelIndex );

        if ( wheelIndex != this.getWheels().length - 1 ) return;
        await Utils.delay( 500 );

        this.getMachine?.eventSpingStop( wheelIndex );
    }



    /**
     * 取得 Symbol Node
     * @returns Node[][]
     */
    public get symbols (): Node[][] {
        let wheels = this.getWheels();
        let symbols = [];
        for ( let i in wheels ) {
            symbols.push( wheels[ i ].getWheelSymbol );
        }

        return symbols;
    }

    public get symbolsID () {
        let wheels = this.getWheels();
        let symbols = {};
        for ( let i in wheels ) {
            let wheelIDs = wheels[ i ].getSymbolIdxIDs;
            let idx = parseInt( i );

            symbols[ idx ] = wheelIDs;
        }

        return symbols;
    }

    /**
     * 取得盤面位置資料
     */
    public get getSymbolIdxData () {
        let wheels = this.getWheels();
        let data = {};
        for ( let i = 0; i < wheels.length; i++ ) {
            data[ i ] = wheels[ i ].getIndexSymbol;
        }

        return data;
    }

    public getSymbolFromID ( id ): Symbol[] {
        if ( id == null ) return [];
        let symbols = this.symbols;
        let resp = [];
        for ( let x in symbols ) {
            for ( let y in symbols[ x ] ) {
                let sym = symbols[ x ][ y ].getComponent( Symbol );
                if ( id != sym.symID ) continue;
                resp.push( sym );
            }
        }

        return resp;
    }

    /**
     * 播放盤面中，指定ID的Symbol 贏分效果
     * @param id symbolID
     */
    public playSymbolWin ( id ): Symbol[] {
        let resp = this.getSymbolFromID( id );
        if ( resp.length == 0 ) return;

        for ( let i = resp.length - 1; i >= 0; i-- ) {
            let sym = resp[ i ];
            sym.showWinState();
        }

        return resp;
    }
}

