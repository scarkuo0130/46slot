import { _decorator, Component, Node, game, Button, EventTarget, Vec3, tween, Color, Sprite, Label } from 'cc';
import { Utils, DATE_TYPE } from '../../../utils/Utils';
import { Orientation, Viewport } from '../../../utils/Viewport';
import { AutoSpin } from '../../AutoSpin';
import { Machine } from '../Machine';
import { gameInformation } from '../../GameInformation';
import { DataManager } from '../../../data/DataManager';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    private initData = {
        "buttons" : {
            'TotalBetIncrease'  : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Total Bet/Increase',         [DATE_TYPE.CLICK_EVENT]: this.clickTotalBetIncrease, 'busyDisable':true  },
            'TotalBetDecrease'  : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Total Bet/Decrease',         [DATE_TYPE.CLICK_EVENT]: this.clickTotalBetDecrease, 'busyDisable':true },
            'Information'       : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Information', [DATE_TYPE.CLICK_EVENT]: this.clickInformation,      'busyDisable':true },
            'Option'            : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Option',      [DATE_TYPE.CLICK_EVENT]: this.clickOption,           'busyDisable':true },
            'SpeedMode'         : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed',       [DATE_TYPE.CLICK_EVENT]: this.clickSpeedMode,        'busyDisable':true },
            'AutoSpin'          : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Auto',        [DATE_TYPE.CLICK_EVENT]: this.clickAutoSpin,         'busyDisable':true },
            'InGameMenu'        : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Buttons/InGameMenu',  [DATE_TYPE.CLICK_EVENT]: this.clickInGameMenu,       'busyDisable':true },
            'Record'            : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Buttons/Record',      [DATE_TYPE.CLICK_EVENT]: this.clickRecord,           'busyDisable':true },
            'Fullscreen'        : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Buttons/Screen',      [DATE_TYPE.CLICK_EVENT]: this.clickFullscreen,       'busyDisable':true },
            'OptionBack'        : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Buttons/Back',        [DATE_TYPE.CLICK_EVENT]: this.clickOptionBack,       'busyDisable':true },
            'Spin'              : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Spin',        [DATE_TYPE.CLICK_EVENT]: this.clickSpin,             'busyDisable':true },
            'Sound'             : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Buttons/Sound',       [DATE_TYPE.CLICK_EVENT]: this.clickSound,            'busyDisable':true },

            // ====== 橫版按鈕 ======
            'OptionLandscape'   : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Landscape/Option',             [DATE_TYPE.CLICK_EVENT]: this.clickOption,     'busyDisable':true },
            'RecordLandscape'   : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Landscape/Content/Record',     [DATE_TYPE.CLICK_EVENT]: this.clickRecord,     'busyDisable':true },
            'SoundLandscape'    : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound',      [DATE_TYPE.CLICK_EVENT]: this.clickSound,      'busyDisable':true },
            'InGameMenuLandscape':{ [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Landscape/Content/InGameMenu', [DATE_TYPE.CLICK_EVENT]: this.clickInGameMenu, 'busyDisable':true },
            'ScreenLandscape'   : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Option Landscape/Content/Screen',     [DATE_TYPE.CLICK_EVENT]: this.clickFullscreen, 'busyDisable':true },
            'INIT_EVENT'        : this.initButton
        },

        'speedMode' : {
            [Machine.SPEED_MODE.NORMAL] : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Normal', 'next':Machine.SPEED_MODE.QUICK },
            [Machine.SPEED_MODE.QUICK]  : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Quick',  'next':Machine.SPEED_MODE.TURBO },
            [Machine.SPEED_MODE.TURBO]  : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Turbo',  'next':Machine.SPEED_MODE.NORMAL},
        },

        'ui' : {
            'balance' : { [DATE_TYPE.TYPE] : Label, [DATE_TYPE.NODE_PATH] : 'Balance/Value',   'lastValue' : 0, },      // 顯示餘額
            'totalBet': { [DATE_TYPE.TYPE] : Label, [DATE_TYPE.NODE_PATH] : 'Total Bet/Value', 'lastValue' : 0,  },    // 顯示總押注
            'totalWin': { [DATE_TYPE.TYPE] : Label, [DATE_TYPE.NODE_PATH] : 'Total Win/Value', 'lastValue' : 0, },    // 顯示總贏分
            'mask'    : { // 共用遮罩
                [DATE_TYPE.TYPE] : Sprite,
                [DATE_TYPE.NODE_PATH] : '---- Common Mask ----',
                'alpha' : 200,          // 遮罩透明度
                'event' : null,         // 遮罩事件
                'tweenSec' : 0.3,       // 遮罩動畫時間
            },
            'INIT_EVENT' : this.initUIValue,
        },

        'optionButtons' : { // Option 按鈕
            'portraitBottom' : { [DATE_TYPE.TYPE]: Node, [DATE_TYPE.NODE_PATH]: 'Bottom Buttons' },
            'portraitOption' : { [DATE_TYPE.TYPE]: Node, [DATE_TYPE.NODE_PATH]: 'Option Buttons' },
            'landscapeOption': { [DATE_TYPE.TYPE]: Node, [DATE_TYPE.NODE_PATH]: 'Option Landscape/Content' },
        },

        'autoSpin' : {
            'button'        : { [DATE_TYPE.TYPE]: Button, [DATE_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/AutoSpin', [DATE_TYPE.CLICK_EVENT]: AutoSpin.StopAutoSpin },
            'label'         : { [DATE_TYPE.TYPE]: Label,  [DATE_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/AutoSpin/Label' },
        }
    };

    /**
     * 
     */
    protected properties = {
        'machine' : null,
        'buttons' : {},
        'ui':{ mask:{ } },
        'speedMode' : {},

        // 忙碌時禁用按鈕
        'BusyDisableButtons' : [],

        // Option 按鈕資料
        'OptionData' : { // 點擊 Option 按鈕後的選項設定
            [Orientation.PORTRAIT] : { // 直版
                'fromPos'    : new Vec3(0, 240, 0),
                'toPos'      : new Vec3(0, -60, 0),
                'active'     : false,
                'running'    : false,
            },

           [Orientation.LANDSCAPE] : {
                'fromPos'    : new Vec3(0, -520, 0),
                'toPos'      : new Vec3(0, -50,  0),
                'active'     : false,
                'running'    : false,
            },
        },
        
    };

    get autoSpinButton() { return this.properties['autoSpin']['button'][DATE_TYPE.COMPONENT]; }
    get autoSpinLabel()  { return this.properties['autoSpin']['label'][DATE_TYPE.COMPONENT]; }

    get autoSpin() { return AutoSpin.Instance; }

    get props() { return this.properties; }

    public static Instance: Controller = null;

    /**
     * 初始化按鈕
     * todo: 加入忙碌時禁用按鈕
     */
    private initButton() {
        const buttonsData = this.initData.buttons;
        const busyDisableButtons = [];

        const keys = Object.keys(buttonsData);
        for(let i=0;i<keys.length;i++) {
            const key = keys[i];
            const data = buttonsData[key];
            const button = data[DATE_TYPE.COMPONENT];
            if ( button == null ) continue;
            busyDisableButtons.push(button);
        }
        this.props['BusyDisableButtons'] = busyDisableButtons;
    }

    private initUIValue() {
        this.props['ui']['balance']['event'] = new EventTarget();
        this.props['ui']['totalWin']['event'] = new EventTarget();
        this.props['ui']['totalBet']['event'] = new EventTarget();
    }

    /**
     * 初始化 Option 按鈕
     */
    private initOptionButton() {
        const optionData = this.props['OptionData'];
        const optionButtons = this.props['optionButtons'];
        optionData[Orientation.PORTRAIT]['fromPos'] = new Vec3(optionButtons['portraitOption'][DATE_TYPE.NODE].position);
        optionData[Orientation.PORTRAIT]['toPos'] = new Vec3(optionButtons['portraitBottom'][DATE_TYPE.NODE].position);
    }

    // #region [[rgba(0, 0, 0, 0)]] 遮罩相關功能
    /**
     * 初始化遮罩
     */
    private initMask() {
        this.props.ui.mask['event']  = new EventTarget();
        this.props.ui.mask[DATE_TYPE.NODE].active = false;
    }

    /**
     * 遮罩開啟/關閉
     * @param active     {boolean} 開啟/關閉
     * @param awaitEvent {boolean} 是否等待事件完成, 預設為不等待
     */
    public async maskActive(active:boolean) {
        const maskData = this.props.ui.mask;
        const [sprite, fadeIn, event, tweenSec ] = [maskData[DATE_TYPE.COMPONENT], maskData['alpha'], maskData['event'], maskData['tweenSec']];
        if ( event && event['running'] ) return;
        
        event.removeAll('done');
        event['running'] = true;
        const fromAlpha = active ? 0 : fadeIn;
        const toAlpha   = active ? fadeIn : 0;
        const data      = { 'value': fromAlpha };

        sprite.node.active = true;
        sprite.color = new Color(0, 0, 0, fromAlpha);
        tween(data).to(tweenSec, { value: toAlpha }, {
            onUpdate:   ()=>{ sprite.color = new Color(0, 0, 0, data['value']); },
            onComplete:(n)=>{ event.emit('done'); }
        }).start();

        await Utils.delayEvent(event);
        event['running'] = false;
        sprite.node.active = active;
    }

    public static MaskActive(active:boolean) { return Controller.Instance.maskActive(active); }

    // #endregion 遮罩

    /**
     * 啟用/禁用所有按鈕
     * @param active 啟用/禁用
     */
    private activeBusyButtons(active:boolean) { this.props['BusyDisableButtons'].forEach((button: Button) => { button.interactable = active; }); }

    protected onLoad(): void {
        Controller.Instance = this;
        this.props['machine'] = Machine.Instance;

        Utils.initData(this.initData, this);
        this.initMask();
        this.initOptionButton();

        console.log(this.properties);
    }

    protected start() {
        this.changeSpeedMode(this.machine.SpeedMode);
    }

    public get machine() :Machine { return this.props['machine']; }

    /**
     * Spin 按鈕事件
     */
    public async clickSpin() {

        if ( this.machine.featureGame ) return false; // 如果在特色遊戲中, 則不可SPIN

        if ( this.machine.spinning ) {
            this.machine.fastStopping = true;
            return false;
        }

        this.clickOption(null, false); // 關閉 Option 功能
        // 禁用所有按鈕
        this.activeBusyButtons(false);
        // 等待 Spin 結束
        await this.machine.clickSpin();
        // 啟用所有按鈕
        this.activeBusyButtons(true);

        // 如果有 AutoSpin 則繼續
        this.autoSpin.decrementCount();
    }

    protected clickInformation() {
        console.log('clickInformation');
    }

    /**
     * 切換顯示 Option 按鈕列表功能
     * @param active 切換按鈕狀態, 預設為反向
     */
    protected clickOption(event, active:boolean=null) {
        const orientation = Viewport.instance.getCurrentOrientation();
        const optionData  = this.props['OptionData'][orientation];
        const optionButtons = this.props['optionButtons'];
        let [ oFromPos, oToPos, isActive, running ] = [ optionData['fromPos'], optionData['toPos'], optionData['active'], optionData['running'], optionData['bottomNode'] ];
        
        const node       = (orientation === Orientation.PORTRAIT) ? optionButtons['portraitOption'][DATE_TYPE.NODE] : optionButtons['landscapeOption'][DATE_TYPE.NODE];
        const bottomNode = (orientation === Orientation.PORTRAIT) ? optionButtons['portraitBottom'][DATE_TYPE.NODE] : null;

        if ( node    == null )      return console.error('Option Node is null', optionData);
        if ( running === true )     return;
        if ( active  === isActive ) return;
        active = !isActive;
        
        const fromPos = active ? oFromPos : oToPos;
        const toPos   = active ? oToPos : oFromPos;
        const self    = this;
        running     = true;

        this.activeBusyButtons(false);
        node.setPosition(new Vec3(fromPos));

        if ( bottomNode != null ) {
            bottomNode.setPosition(new Vec3(toPos));
            tween(bottomNode).to(0.3, { position: fromPos }, { easing:'backOut' }).start();
        }
        const completeEvent = ()=> { optionData['running'] = false; optionData['active'] = active; self.activeBusyButtons(true); };
        completeEvent.bind(this);
        tween(node).to(0.3, { position: toPos }, { easing:'backOut', onComplete:completeEvent }).start();
    }

    /**
     * 關閉 Option 按鈕列表 功能
     */
    protected clickOptionBack() { return this.clickOption(null, false); }

    /**
     * 點擊切換速度模式
     */
    protected clickSpeedMode() {
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        const nextMode = speedMode[lastMode]['next'];

        return this.changeSpeedMode(nextMode);
    }

    /**
     * 切換速度模式
     * @param mode { Machine.SPEED_MODE } 速度模式代號
     */
    private changeSpeedMode(mode:number) {
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        if ( lastMode === mode ) return;

        speedMode[mode][DATE_TYPE.NODE].active = true;
        speedMode[lastMode][DATE_TYPE.NODE].active = false;

        return this.machine.setSpeedMode(mode);
    }

    public static ChangeSpeedMode(mode:number) { return Controller.Instance.changeSpeedMode(mode); }

    protected clickAutoSpin() {
       AutoSpin.OpenUI();
    }

    protected clickStopAutoSpin() {

    }

    protected clickInGameMenu() {
        console.log('clickInGameMenu');
    }

    protected clickRecord() {
        console.log('clickRecord');
    }

    protected clickSound() {
        console.log('clickSound');
    }

    protected clickFullscreen() {
        console.log('clickFullscreen');
    }

    /** 更新餘額顯示 */
    public refreshBalance() {
        const balance = DataManager.instance.userData.credit;
        this.changeBalance(balance);
    }

    /**
     * 變更餘額顯示 (非同步)
     * @param to          {number}         目標數字
     * @param from        {number | null}  起始數字, null = 預設為上次數字
     * @param tweenSec    {float}           滾動秒數, 0 = 不滾動顯示
     * @returns {Promise<any>}
     */
    public async changeBalance(to:number, from:number=null, tweenSec=1) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenSec === 0 ) return this.setBalance(to);

        from = from ?? this.props['ui']['balance']['lastValue'];
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setBalance(data['value']), this.props['ui']['balance']['event']);
    }

    /**
     * 顯示餘額
     * @param balance {number} 餘額
     * @returns {void}
     */
    public setBalance(balance:number) {
        const balanceLabel:Label = this.props['ui']['balance'][DATE_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;
        this.props['ui']['balance']['lastValue'] = balance;
        balanceLabel.string = `${currencySymbol} ${Utils.numberComma(balance)}`;
    }

    /**
     * 變更總贏分顯示 (非同步)
     * @param to          {number}         目標數字
     * @param from        {number | null}  起始數字, null = 預設為上次數字
     * @param tweenSec    {float}           滾動秒數, 0 = 不滾動顯示
     * @returns {Promise<any>}
     */
    public async changeTotalWin(to:number, from:number=null, tweenSec=1) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenSec === 0 ) return this.setTotalWin(to);
        from = from ?? this.props['ui']['totalWin']['lastValue'];
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setTotalWin(data['value']), this.props['ui']['totalWin']['event']);
    }

    /**
     * 顯示總贏分
     * @param totalWin 顯示總贏分
     * @returns { void }
     */

    public setTotalWin(totalWin:number) {
        const totalWinLabel:Label = this.props['ui']['totalWin'][DATE_TYPE.COMPONENT];
        const currencySymbol      = gameInformation._currencySymbol;

        this.props['ui']['totalWin']['lastValue'] = totalWin;
        
        if ( totalWin === 0 ) return totalWinLabel.string = '';
        return totalWinLabel.string = `${currencySymbol} ${Utils.numberComma(totalWin)}`;
    }

    /**
     * 滾動數字工具
     * @todo 提供給 TotalWin, TotalBet, Balance 滾動數字使用
     * @param to            {number}      目標數字
     * @param from          {number}      起始數字
     * @param tweenSec      {float}        滾動秒數
     * @param onUpdate      {function}    更新數字事件
     * @param eventTarget   {EventTarget} 結束觸發事件
     */
    private async tweenValue(to:number, from:number, tweenSec:number, onUpdate:any, eventTarget:EventTarget) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( !onUpdate || !eventTarget ) return;

        let data = { 'value': from };
        eventTarget.removeAll('done');
        tween(data).to(tweenSec, { value: to }, { onUpdate: onUpdate, onComplete: ()=> eventTarget.emit('done') }).start();

        return await Utils.delayEvent(eventTarget);
    }


    //#region TotalBet 相關功能 [[rgba(0, 0, 0, 0)]]

    /**
     * 改變總押注顯示數字 (非同步)
     * @param to          {number}         目標數字
     * @param from        {number | null}  起始數字, null = 預設為上次數字
     * @param tweenSec    {float}           滾動秒數
     * @returns {Promise<any>}
     */
    public async changeTotalBet(to:number, from:number=null, tweenSec=0.2) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenSec === 0 ) return this.setTotalBet(to);
        from = from ?? this.props['ui']['totalBet']['lastValue'];
        
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setTotalBet(data['value']), this.props['ui']['totalBet']['event']);
    }

    /**
     * 顯示總押注
     * @param totalBet {number} 總押注
     * @returns {void}
     */
    private setTotalBet(totalBet:number) {
        const totalBetLabel:Label = this.props['ui']['totalBet'][DATE_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;

        this.props['ui']['totalBet']['lastValue'] = totalBet;
        totalBetLabel.string = `${currencySymbol} ${Utils.numberComma(totalBet)}`;
    }

    /**  設定押注Index (private) */
    private set betIdx(value:number) { this.props['ui']['totalBet']['betIdx'] = value; }

    /**  取得押注Index */
    public get betIdx() { return this.props['ui']['totalBet']['betIdx']; }

    /**  取得押注額度 */
    private get betValue() { 
        const [ coinValue, lineBet, lineTotal ] = [
            gameInformation.coinValueArray[this.betIdx],
            gameInformation.lineBet,
            gameInformation.lineTotal
        ];

        return coinValue * 1000 * lineBet * lineTotal / 1000;
    }

    /**  取得總押注 */
    public get totalBet() { return this.betValue; }

    /**  取得押注額度數量 */
    private get betIdxLength() { return gameInformation.coinValueArray.length; }

    /**  更新押注額 */
    public refreshTotalBet() { /*this.setTotalBet(this.betValue);*/ this.changeTotalBet(this.betValue); }

    /**  減少押注 */
    protected clickTotalBetDecrease() { this.changeTotalBetIdx(this.betIdx - 1); }

    /**  增加押注 */
    protected clickTotalBetIncrease() { this.changeTotalBetIdx(this.betIdx + 1); }

    /** 
     * 改變押注 
     * @param idx {number} 指定押注Index
     */
    private changeTotalBetIdx(idx:number) {
        const length = this.betIdxLength;

        if ( idx >= length ) idx = 0;
        if ( idx < 0 ) idx = length - 1;
        this.betIdx = idx;
        this.refreshTotalBet();
    }

    //#endregion TotalBet 相關功能

}