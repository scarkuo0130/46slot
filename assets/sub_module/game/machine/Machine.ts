import { _decorator, Node, Component, EventHandler, game, director, find } from 'cc';
import { Reel, SPIN_MODE, SPIN_MODE_DATA } from './Reel';
import { Controller, SPIN_ACTION } from './Controller';
import { gameInformation } from '../GameInformation';
import { playerInformation } from '../PlayerInformation';
import { SlotStates, SlotEvents, StateManager } from '../StateManager';
import { slotData } from '../SlotData';
import { BigWin, BIGWIN_TYPE } from './BigWin';
import { Paytable } from './pay/PayTable';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { DataManager } from '../../data/DataManager';
import { SimpleAudioClipData, SoundManager } from './SoundManager';
import { FeatureGame } from './FeatureGame/FeatureGame';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

export enum MACHINE_STATE {
    IDLE = 0,
    SPINING = 1,
    PERFORMING = 2,
}

export enum MACHINE_STATUS {
    MAIN_GAME = 0,
    BONUS_GAME = 2,
    FREE_GAME = 1,
}


@ccclass( 'MachineInscept' )
export class MachineInscept {

    @property( { type: Node, displayName: 'ReelNode', tooltip: '輪盤帶 Node', group: { name: 'SettingNode', id: '0' } } )
    public reel: Node;

    @property( { displayName: 'ReelPath', tooltip: '輪盤帶 Node', group: { name: 'SettingPath', id: '0' } } )
    public reelPath = "";

    @property( { type: Node, displayName: 'ControllerNode', tooltip: '控制器物件設定', group: { name: 'SettingNode', id: '0' } } )
    public controllerNode: Node;

    @property( { displayName: 'ControllerPath', tooltip: '控制器物件設定', group: { name: 'SettingPath', id: '0' } } )
    public controllerPath = ""

    @property( { type: Node, displayName: 'BigWinNode', group: { name: 'SettingNode', id: '0' } } )

    public bigWin: Node;

    @property( { displayName: 'BigWinPath', group: { name: 'SettingPath', id: '0' } } )
    public bigwinPath = "";

    @property( { type: Node, displayName: 'PaytableNode', tooltip: '賠付規則模組', group: { name: 'SettingNode', id: '0' } } )
    public payTable: Node;

    @property( { displayName: 'PaytablePath', tooltip: '賠付規則模組', group: { name: 'SettingPath', id: '0' } } )
    public payTablePath = "";

    @property( { type: Node, displayName: 'FeatureGameNode', group: { name: 'SettingNode', id: '0' } } )
    public featureGameNode: Node;

    @property( { displayName: 'FeatureGamePath', group: { name: 'SettingPath', id: '0' } } )
    public featureGamePath = "";


    @property( { type: SimpleAudioClipData, displayName: 'SpinAudioClip', tooltip: '播放Spin音效', group: { name: 'SpinMode', id: '1' } } )
    public spinAudio: SimpleAudioClipData;

    public controller: Controller;
}

@ccclass( "MachineEventHandler" )
export class MachineEventHandler {
    @property( { type: [ EventHandler ], displayName: 'SpinEvent', tooltip: '啟動Spin事件' } )
    public spinEvent: EventHandler[] = [];

    @property( { type: [ EventHandler ], displayName: 'SpinStopEvent', tooltip: '停止Spin事件' } )
    public spinStopEvent: EventHandler[] = [];

    @property( { type: [ EventHandler ], displayName: 'SpinResponseEvent', tooltip: '取得Spin資料事件' } )
    public spinResponseEvent: EventHandler[] = [];
}

@ccclass( 'Machine' )
@disallowMultiple( true )
@menu( 'SlotMachine/Machine' )
@help( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.do51z03dha0i' )
/**
 * 老虎機台
 * @doc https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.do51z03dha0i
 */
export class Machine extends Component {

    @property( { type: MachineInscept, displayName: 'Setting', tooltip: '機台設定', group: { name: 'setting', id: '100', displayOrder: 100 } } )
    public machineSetting: MachineInscept = new MachineInscept();

    @property( { type: MachineEventHandler, displayName: 'MachineEvents', tooltip: "各種事件設定", group: { name: 'events', id: '101', displayOrder: 101 } } )
    public machineEvents: MachineEventHandler = new MachineEventHandler();

    /**
     * @from Machine.spinCallBack()
     * @todo 紀錄本次 Spin 結果
     */
    public spinData: any = null;

    // StateManager.instance.slotService
    public slotService;


    protected _reel: Reel;
    public get reel (): Reel { return this._reel; }
    private _controller: Controller;
    public get controller (): Controller { return this._controller; };

    private _bigWin: BigWin;
    public get bigWin (): BigWin { return this._bigWin; };

    private _payTable: Paytable
    public get payTable (): Paytable { return this._payTable; };

    private _featureGame: FeatureGame;
    public get featureGame (): FeatureGame { return this._featureGame; }

    public bigWinEventHandler: EventHandler;
    public performWinScoreEventHandler: EventHandler;

    public enterFeatureGameEventHandler: EventHandler;

    public _state: MACHINE_STATE = MACHINE_STATE.IDLE;
    public _status: MACHINE_STATUS = MACHINE_STATUS.MAIN_GAME;
    public _tmpStopPerform: boolean = false;

    public get coin_value (): number { return this.controller.coin_value; }
    public get totalBet (): number { return this.controller.totalBet; }
    public get state (): MACHINE_STATE { return this._state; }
    public set setState ( state: MACHINE_STATE ) { this._state = state; }
    public get status (): MACHINE_STATUS { return this._status; }
    public set setStatus ( status: MACHINE_STATUS ) { this._status = status; }
    public get gameInformation () { return gameInformation; }

    protected notifyFail ( message ): boolean {
        console.error( `Machine ${ this.node[ ' INFO ' ] } ${ message }`, this );
        return false;
    }

    @isDevelopFunction( true )
    public SpinTest ( data ) {
        console.log( data );
        this.spin( true );
        this.spinResponse( data );
    }

    @isDevelopFunction()
    public developInit () {
        cc.machine = this;
    }

    protected initReel (): boolean {

        console.log( 'initReel' );
        if ( this.machineSetting.reel == null && this.machineSetting.reelPath.length == 0 ) {
            return this.notifyFail( '沒有設定 Reel Node 或是路徑' );
        }
        let reel: Reel = this.machineSetting.reel?.getComponent( Reel );
        if ( reel == null ) reel = find( this.machineSetting.reelPath )?.getComponent( Reel );
        if ( reel == null ) return this.notifyFail( 'Reel 設定失敗' );

        this._reel = reel;
        console.log( 'reel:', reel );
        reel.setMachine( this );
        return true;
    }

    protected initController (): boolean {
        if ( this.machineSetting.controllerNode == null && this.machineSetting.controllerPath.length == 0 ) {
            return this.notifyFail( '沒有設定 Controller Node 或是路徑' );
        }

        let controller: Controller = this.machineSetting.controllerNode?.getComponent( Controller );
        if ( controller == null ) controller = find( this.machineSetting.controllerPath )?.getComponent( Controller );
        if ( controller == null ) return this.notifyFail( 'Controller 設定失敗' );

        this._controller = controller;
        controller.setMachine( this );
        return true;
    }

    protected initBigWin (): boolean {
        if ( this.machineSetting.bigWin == null && this.machineSetting.bigwinPath.length == 0 ) {
            return this.notifyFail( '沒有設定 BigWin Node 或是路徑' );
        }
        let bigWin: BigWin = this.machineSetting.bigWin?.getComponent( BigWin );
        if ( bigWin == null ) bigWin = find( this.machineSetting.bigwinPath )?.getComponent( BigWin );
        if ( bigWin == null ) return this.notifyFail( 'BigWin 設定失敗' );

        this._bigWin = bigWin;
        bigWin.setMachine( this );
        return true;
    }

    protected initPaytable (): boolean {
        if ( this.machineSetting.payTable == null && this.machineSetting.payTablePath.length == 0 ) {
            return this.notifyFail( '沒有設定 Paytable Node 或是路徑' );
        }
        let paytable: Paytable = this.machineSetting.payTable?.getComponent( Paytable );
        if ( paytable == null ) paytable = find( this.machineSetting.payTablePath )?.getComponent( Paytable );
        if ( paytable == null ) return this.notifyFail( 'Paytable 設定失敗' );

        this._payTable = paytable;
        paytable.setMachine( this );
        return true;
    }

    protected initFeatureGame (): boolean {
        if ( this.machineSetting.featureGameNode == null && this.machineSetting.featureGamePath.length == 0 ) {
            return false;
        }

        let featureGame: FeatureGame = this.machineSetting.featureGameNode?.getComponent( FeatureGame );
        if ( featureGame == null ) featureGame = find( this.machineSetting.featureGamePath )?.getComponent( FeatureGame );

        this._featureGame = featureGame;
        featureGame.setMachine( this );
        return true;
    }

    protected init () {
        this.initReel();
        this.initController();
        this.initBigWin();
        this.initPaytable();
        this.initFeatureGame();

        this.slotService = StateManager.instance.slotService;

        let callSpinData = new EventHandler();
        callSpinData.target = this.node;
        callSpinData.component = 'Machine';
        callSpinData.handler = 'spinResponse';
        slotData.spinResponseEventHandler = callSpinData;

        let errorMessage = new EventHandler();
        errorMessage.target = this.node;
        errorMessage.component = 'Machine';
        errorMessage.handler = 'errorMessage';
        slotData.errorCodeHandler = errorMessage;

        this._state = MACHINE_STATE.IDLE;
        this._status = MACHINE_STATUS.MAIN_GAME;

        this.bigWinEventHandler = new EventHandler();
        this.bigWinEventHandler.component = 'Machine';
        this.bigWinEventHandler.handler = 'bigWinCallback';
        this.bigWinEventHandler.target = this.node;
        this.bigWinEventHandler.customEventData = null;

        this.performWinScoreEventHandler = new EventHandler();
        this.performWinScoreEventHandler.component = 'Machine';
        this.performWinScoreEventHandler.handler = 'performWinScoreCallBack';
        this.performWinScoreEventHandler.target = this.node;
        this.performWinScoreEventHandler.customEventData = null;

        this.enterFeatureGameEventHandler = new EventHandler();
        this.enterFeatureGameEventHandler.component = 'Machine';
        this.enterFeatureGameEventHandler.handler = 'mainGameEnterFeatureGame';
        this.enterFeatureGameEventHandler.target = this.node;
        this.enterFeatureGameEventHandler.customEventData = null;
    }


    protected onLoad (): void {
        this.init();
        this.developInit();
        this.onload();
    }

    /**
     * 提供繼承 machine 的專案使用 onLoad() 之後呼叫
     */
    protected onload () { }

    /**
     * 提供繼承 machine 的專案使用 start() 之後呼叫
     */
    protected onstart () { }

    protected start (): void {
        console.log( 'sites:', Utils.getSite() );
        console.log( 'userData', DataManager.instance.userData );
        console.log( 'gameInformation', gameInformation );
        let spinMode = SPIN_MODE_DATA[ gameInformation.spinMode ];
        this.setSpinMode( spinMode );
        this.onstart();

        let self = this;
        setTimeout( () => {
            self.setSpinMode( spinMode );
            this.androidFullScreen();
        }, 500 );
    }

    public errorMessage ( response: any ) {
        let errorCode = response.error_code;
        return cc.Dailog.errorMessage( errorCode );
        // return this.controller.openErrorUI(`Internet Error ${errorCode}\nClick OK button to reconnect`);
    }

    @isDevelopFunction( true )
    public testErrorCode ( errorCode: number ) {
        return cc.Dailog.errorMessage( errorCode );
    }

    /**
     * Andorid 手機自動全螢幕
     * @returns 
     */
    protected androidFullScreen () {
        if ( cc.sys.os != "Android" ) return;
        this.controller.clickFullScreen();
    }

    /**
     * 執行 event
     */
    public callEvents ( events: EventHandler[] ) {
        if ( events === null ) return;
        if ( events.length === 0 ) return;

        for ( let i in events ) {
            if ( events[ i ] === null ) continue;
            events[ i ].emit( [ events[ i ].customEventData ] );
        }
    }

    //#region SpinStats 從 Spin 到停輪 ---------------------------------------------

    /**
     * 從Server得到 Spin 結果
     * @from SlotData.getSpinData()
     * @from init Event => Machine.onLoad() slotData.spinResponseEventHandler
     * @param spinData 
     */
    public spinResponse ( spinData: any ) {
        this.callEvents( this.machineEvents.spinResponseEvent );
        this.spinData = spinData;
        if ( spinData == null || spinData.length == 0 ) return;

        let result = spinData[ 'main_game' ][ 'result_reels' ];
        // For Test
        let wheels = this.reel.getWheels();
        let newResult = result.concat();

        this.reel.setResult( newResult );
    }

    /** 取得 Scatter 資料 */
    public get scatterInfo () {
        if ( this.spinData == null ) return null;
        if ( this.spinData[ 'main_game' ] == null ) return null;
        if ( this.spinData[ 'main_game' ][ 'scatter_info' ] == null ) return null;

        return this.spinData[ 'main_game' ][ 'scatter_info' ];
    }

    /**
     * Spin 重置資料
     */
    public resetSpinData () {
        this._tmpStopPerform = false;
        this.spinData = null;
        this.controller.setTotelWin( 0 );
        slotData.resetSpinData();
        this.reel.setResult( null );
    }

    public eventActiveAutoSpin () {
        if ( this.state != MACHINE_STATE.IDLE ) return;
        if ( this.status != MACHINE_STATUS.MAIN_GAME ) return;

        return this.spin();
    }

    /**
     * 播放 Spin 音效
     * todo 在autoSpin 狀態下不播放音效
     * @returns true: 播放
     */
    public playSpinAudio () {
        if ( this.controller.autoSpin.active === true ) return false;
        return SoundManager.playSoundData( this.machineSetting.spinAudio );
    }

    /**
     * 開始轉輪
     * @from clickSpinButton()
     */
    public spin ( noCall: boolean = false ): boolean {

        let betCredit: number = this.totalBet;
        // 錢不夠
        if ( noCall == false && DataManager.instance.userData.credit < betCredit ) {
            cc.Dailog.errorMessage( 220 );
            return false;
        }

        this.callEvents( this.machineEvents.spinEvent );
        this.payTable.cancelPerform();
        this.resetSpinData();
        this.reel.Spin(); /// 轉輪
        this.playSpinAudio();

        if ( noCall === false ) {
            let balance = DataManager.instance.userData.credit;
            let totalBet = this.totalBet;

            this.controller.showBalance( balance - totalBet );
            playerInformation.isBuyFreeGame = 0;
            this.spinCommand();
        }

        this.setState = MACHINE_STATE.SPINING;
        this.controller.checkSpinState( 1 );
        return true;
    }

    public async spinCommand (): Promise<any> {
        StateManager.instance.sendSpinCommand();
    }

    public async sendBuySpinCommand ( totalBet: number ): Promise<any> {
        let result = await StateManager.instance.sendBuySpinCommand( totalBet );
        return result;
    }

    /**
     * 買 feature game
     * @param totalBet 
     * @returns 
     */
    public async buySpin ( totalBet: number ): Promise<boolean> {
        if ( this.state !== MACHINE_STATE.IDLE ) return;
        if ( this.status !== MACHINE_STATUS.MAIN_GAME ) return;

        let balance = DataManager.instance.userData.credit;

        this.resetSpinData();
        let result = await this.sendBuySpinCommand( totalBet );
        if ( result == null ) return false;
        if ( this.spinData == null ) return false;
        if ( this.spinData[ 'bet_credit' ] == null ) return false;

        let bet_credit = this.spinData[ 'bet_credit' ];
        let showBalance = balance - bet_credit;
        this.controller.showBalance( showBalance );
        this.callEvents( this.machineEvents.spinEvent );
        this.payTable.cancelPerform();

        this.reel.Spin();
        this.setState = MACHINE_STATE.SPINING;
        this.controller.checkSpinState( 1 );
        this.playSpinAudio();
        return true;
    }

    /**
     * 從 Reel 送來停輪事件
     * @param wheelIndex 停輪代號
     */
    public async eventSpingStop ( wheelIndex: number ) {
        this.controller.eventSpingStop(); // 通知控制台
        this.callEvents( this.machineEvents.spinStopEvent );
        if ( await this.featureGame.eventSpingStop( wheelIndex ) === true ) return false;
        return this.checkWin();
    }

    public async stopWheel ( wheelIndex: number ) { return; }

    protected checkAutoSpin ( state: MACHINE_STATE ): boolean {
        if ( this.controller.autoSpin.getActive === false ) return false;

        this.controller.autoSpin.setActive = false;
        this.controller.checkSpinState( state === MACHINE_STATE.IDLE ? 0 : 1 );
        return true;
    }


    /**
     * 點擊 Spin 按鈕
     * @from controller.
     * @returns 成功
     */
    public clickSpinButton (): boolean {

        switch ( this.state ) {
            /** 靜止狀態，就執行 Spin **/
            case MACHINE_STATE.IDLE:
                if ( this.checkAutoSpin( this.state ) === true ) return false;
                return this.spin();

            /** 已經是 SPIN, 就執行快停 **/
            case MACHINE_STATE.SPINING:
                /// 如果正在 autoSpin 就取消
                if ( this.checkAutoSpin( this.state ) === true ) return false;

                /// 沒拿到資料，不能停
                if ( this.spinData === null ) return false;
                this._tmpStopPerform = true;

                // 快停
                this.reel.fastStopSpin();
                return true;

            /** Feature Game 狀態，按按鈕是無效的 **/
            case MACHINE_STATE.PERFORMING:
                this._tmpStopPerform = true;
                return false;

            default:
                return false;
        }
    }

    private _tempTotalWin;
    /**
     * 得分判斷
     * @todo 判斷是否進入 feature game
     * @todo 判斷有沒有得分
     */
    public checkWin () {
        /// 先看看有沒有進入 FeatureGame，中斷目前的執行
        if ( this.isFeatureGame() === true ) {

            // mainGame贏分
            let totalWin = this.payoutMainGameBalance( this.spinData );
            this._tempTotalWin = totalWin;

            /// 沒中獎
            if ( totalWin === 0 ) {
                return this.mainGameEnterFeatureGame();  /// 進入 Feature Game
            }

            this.setState = MACHINE_STATE.PERFORMING;
            // 有沒有 BigWin, 要不要播BigWin
            if ( this.bigWin.isBigWin( totalWin ) != BIGWIN_TYPE.NONE && this.isPerformBigWin() === true ) {
                return this.bigWin.activeBigWin( totalWin, this.enterFeatureGameEventHandler );
            }

            return this.performWinScore( totalWin, this.enterFeatureGameEventHandler );

        } else {
            let totalWin = this.payoutBalance( this.spinData );
            this._tempTotalWin = totalWin;

            /// 沒中獎
            if ( totalWin === 0 ) {
                return this.spinComplete();  /// 切回原來狀態
            }

            this.setState = MACHINE_STATE.PERFORMING;
            let isPerformBigWin = this.isPerformBigWin();
            // 有沒有 BigWin, 要不要播BigWin
            if ( this.bigWin.isBigWin( totalWin ) != BIGWIN_TYPE.NONE && isPerformBigWin === true ) {
                return this.bigWin.activeBigWin( totalWin, this.bigWinEventHandler );
            }

            return this.performWinScore( totalWin );
        }

    }

    public async mainGameEnterFeatureGame () {
        if ( this.featureGame == null ) return;
        await this.featureGame.enterFeatureGame();
    }

    public async featureGameCheckBigWin ( totalWin: number ): Promise<void> {
        if ( this.bigWin.isBigWin( totalWin ) != BIGWIN_TYPE.NONE && this.isPerformBigWin() === true ) {
            await this.bigWin.activeBigWin( totalWin, this.bigWinEventHandler );
        }
        return;
    }
    /**
     * BinWin 執行完畢回傳
     */
    public bigWinCallback ( totalWin ) { return this.performWinScore( totalWin ); }

    /** 表演中獎 */
    public performWinScore ( totalWin: number, callbackEvent: EventHandler = null ) {
        if ( !this.spinData?.[ 'main_game' ] ) return;

        this.controller.showTotalWin( totalWin );
        if ( callbackEvent == null ) callbackEvent = this.performWinScoreEventHandler;
        return this.payTable.performAllPayline( this.spinData[ 'main_game' ], totalWin, callbackEvent );
    }

    /**
     * 
     */
    public performWinScoreCallBack () {
        let isComplete = this.spinComplete();
        if ( isComplete === false ) return;

        return this.payTable.performSingleLineLoop();
    }

    /**
     * 要不要播放 BigWin 預設都是要播的
     * @returns true | false, 
     */
    protected isPerformBigWin (): boolean { return true; }

    /**
     * 是否要進入 FeatureGame
     * @todo 需要做 FeatureGame, 在這邊開始
     * @todo 先判斷盤面是否有 Feature Game
     * @todo 然後使用會傳值中斷 Spin 流程
     * @returns 只要有任何回傳值，都算是進入 FeatureGame, 一般 Spin 流程在此中斷
     */
    public isFeatureGame (): boolean {
        if ( this.status != MACHINE_STATUS.MAIN_GAME ) return true;
        if ( this.featureGame != null ) return this.featureGame.isFeatureGame( this.spinData );
        return false;
    }

    /** 有沒有中獎 
     * @returns 數值: 中獎金額
    */
    public payoutBalance ( checkData: any ): number { return checkData[ 'payout_credit' ]; }

    public payoutMainGameBalance ( checkData: any ): number { return checkData[ 'main_game' ][ 'pay_credit_total' ]; }

    /**
     * 完成 Spin功能後要做的事情
     * @todo 判斷是否要做接下來的動作
     * @todo AutoSpin 判斷
     * @todo FreeSpin 判斷
     * @returns boolean: True 沒有要做其他事, 如果有中獎會繼續表演
     */
    public spinComplete (): boolean {
        this.updateData();

        this.setState = MACHINE_STATE.IDLE;
        let userBalance = DataManager.instance.userData.credit;
        let totalWin = this._tempTotalWin;

        if ( this._tmpStopPerform === true ) return false;

        /// 有 AutoSpin 狀況下需要判斷
        if ( this.status == MACHINE_STATUS.MAIN_GAME && this.controller.autoSpin.getActive === true ) {
            // 要關掉 autoSpin
            if ( this.controller.autoSpin.checkStopAutoSpin( totalWin, userBalance ) == true ) {
                this.controller.checkSpinState( SPIN_ACTION.NORMAL );
                return false;
            }

            // 繼續 autospin
            this.spin();
            return false;
        }

        return true;
    }

    public updateData () {
        if ( this.spinData == null ) return;
        let balance = this.spinData.user_credit;
        DataManager.instance.userData.credit = balance;

        this.controller.setBalance( balance );
    }

    //#endregion SpinStats -----------------------------------------------------

    public getSpinMode (): SPIN_MODE {
        if ( this.reel == null ) return SPIN_MODE.NORMAL_MODE;
        return this.reel.getSpinMode();
    }
    public setSpinMode ( mode: SPIN_MODE ): SPIN_MODE {
        let nowMode = this.reel.getSpinMode();
        if ( this.state != MACHINE_STATE.IDLE ) return nowMode;

        return this.reel.setSpinMode( mode );
    }

    protected updateUserCredit () { return this.controller.showBalance( DataManager.getUserCredit ); }

    /**
     * 是否作聽牌特效
     * 如果對於聽牌效果做額外規則，可以複寫此函式
     * @param wheelIdx 滾輪代號
     * @param nearIdx  原本聽牌滾輪代號
     * @return null: 依照原始，不做改變
     * @return true : 要做聽牌特效, false 不做聽牌特效
     */
    public isNearWheels ( wheelIdx: number, baseNearIDx: number ) { return null; }

    /**
     * 指定 symbolID 取得賠付資料表
     * 可客製化處理
     * @param symbolID symbol id 
     * @returns 陣列: [0,0,300,500,700]
     * @returns null: 使用預設程式
     */
    public getPaytableSymbol ( symbolID ): number[] { return null; }

}

