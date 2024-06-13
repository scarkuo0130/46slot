import { _decorator, Component, Node, game, Button, EventTarget, Vec3, tween, Color, Sprite, Label } from 'cc';
import { Utils, DATE_TYPE } from '../../../utils/Utils';
import { Orientation, Viewport } from '../../../utils/Viewport';
import { AutoSpin } from '../../AutoSpin';
import { Machine2_0 } from '../Machine2.0';
import { gameInformation } from '../../GameInformation';
import { DataManager } from '../../../data/DataManager';
const { ccclass, property } = _decorator;

@ccclass('Controller2_0')
export class Controller2_0 extends Component {

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
            [Machine2_0.SPEED_MODE.NORMAL] : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Normal', 'next':Machine2_0.SPEED_MODE.QUICK },
            [Machine2_0.SPEED_MODE.QUICK]  : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Quick',  'next':Machine2_0.SPEED_MODE.TURBO },
            [Machine2_0.SPEED_MODE.TURBO]  : { [DATE_TYPE.TYPE] : Sprite, [DATE_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Turbo',  'next':Machine2_0.SPEED_MODE.NORMAL},
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

    get props() { return this.properties; }

    public static Instance: Controller2_0 = null;

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

    public static MaskActive(active:boolean) { return Controller2_0.Instance.maskActive(active); }

    // #endregion 遮罩

    /**
     * 啟用/禁用所有按鈕
     * @param active 啟用/禁用
     */
    private activeBusyButtons(active:boolean) { this.props['BusyDisableButtons'].forEach((button: Button) => { button.interactable = active; }); }

    protected onLoad(): void {
        Controller2_0.Instance = this;
        this.props['machine'] = Machine2_0.Instance;

        Utils.initData(this.initData, this);
        this.initMask();
        this.initOptionButton();

        console.log(this.properties);
    }

    protected start() {
        this.changeSpeedMode(this.machine.SpeedMode);
    }

    public get machine() :Machine2_0 { return this.props['machine']; }

    //region 按鈕事件 [[rgba(0, 0, 0, 0)]]

    /**
     * Spin 按鈕事件
     */
    protected async clickSpin() {

        if ( this.machine.featureGame ) return false; // 如果在特色遊戲中, 則不可SPIN

        if ( this.machine.spinning ) {
            this.machine.fastStopping = true;
            return false;
        }

        console.log('clickSpin');
        this.clickOption(null, false); // 關閉 Option 功能
        // 通知 machine 開始 Spin
        // let waitEvent: EventTarget = this.machihe.spin();
        // 有取得 waitEvent 表示 machine 開始 Spin
        // if ( waitEvent == null ) return; 
        // 禁用所有按鈕
        console.log(this.properties['BusyDisableButtons']);
        this.activeBusyButtons(false);
        // 等待 Spin 結束
        // await Utils.delayEvent(waitEvent);

        // await Utils.delay(1000); // 模擬等待時間
        await this.machine.clickSpin();

        // 啟用所有按鈕
        this.activeBusyButtons(true);
        
    }

    protected clickTotalBetDecrease() { this.changeTotalBetIdx(this.betIdx - 1); }
    protected clickTotalBetIncrease() { this.changeTotalBetIdx(this.betIdx + 1); }
    private changeTotalBetIdx(idx:number) {
        const length = this.betIdxLength;

        if ( idx >= length ) idx = 0;
        if ( idx < 0 ) idx = length - 1;
        this.betIdx = idx;
        this.refreshTotalBet();
    }

    protected clickInformation() {
        console.log('clickInformation');
    }

    /**
     * 切換顯示 Option 功能
     * @param event  按鈕事件, 目前無使用
     * @param active 切換按鈕狀態, 預設為反向
     * @returns 
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

    protected clickOptionBack() { return this.clickOption(null, false); }

    protected clickSpeedMode() {
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        const nextMode = speedMode[lastMode]['next'];

        return this.changeSpeedMode(nextMode);
    }

    protected changeSpeedMode(mode:number) {
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        if ( lastMode === mode ) return;

        speedMode[mode][DATE_TYPE.NODE].active = true;
        speedMode[lastMode][DATE_TYPE.NODE].active = false;

        return this.machine.setSpeedMode(mode);
    }

    public static ChangeSpeedMode(mode:number) { return Controller2_0.Instance.changeSpeedMode(mode); }

    protected clickAutoSpin() {
       AutoSpin.OpenUI();
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

    //#endregion 按鈕事件


    //#region [[rgba(0, 0, 0, 0)]] 數值畫面功能

    public refreshBalance() {
        const balance = DataManager.instance.userData.credit;
        this.changeBalance(balance);
    }

    public async changeBalance(to:number, from:number=null, tweenNumber:boolean=true, tweenSec=1) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenNumber === false ) return this.setBalance(to);

        from = from ?? this.props['ui']['balance']['lastValue'];
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setBalance(data['value']), this.props['ui']['balance']['event']);
    }

    public setBalance(balance:number) {
        const balanceLabel:Label = this.props['ui']['balance'][DATE_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;
        this.props['ui']['balance']['lastValue'] = balance;
        balanceLabel.string = `${currencySymbol} ${Utils.numberComma(balance)}`;
    }

    public async changeTotalWin(to:number, from:number=null, tweenNumber:boolean=true, tweenSec=1) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenNumber === false || tweenSec === 0 ) return this.setTotalWin(to);
        from = from ?? this.props['ui']['totalWin']['lastValue'];
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setTotalWin(data['value']), this.props['ui']['totalWin']['event']);
    }

    public setTotalWin(totalWin:number) {
        const totalWinLabel:Label = this.props['ui']['totalWin'][DATE_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;

        this.props['ui']['totalWin']['lastValue'] = totalWin;
        if ( totalWin > 0 ) return totalWinLabel.string = `${currencySymbol} ${Utils.numberComma(totalWin)}`;
        totalWinLabel.string = '';
    }

    public async changeTotalBet(to:number, from:number=null, tweenNumber:boolean=true, tweenSec=0.2) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( tweenNumber === false || tweenSec === 0 ) return this.setTotalBet(to);
        from = from ?? this.props['ui']['totalBet']['lastValue'];
        
        return await this.tweenValue(to, from, tweenSec, (data)=> this.setTotalBet(data['value']), this.props['ui']['totalBet']['event']);
    }

    public async tweenValue(to:number, from:number, tweenSec:number, onUpdate:any, eventTarget:EventTarget) {
        if ( to == null ) return;
        if ( to === from ) return;
        if ( !onUpdate || !eventTarget ) return;

        let data = { 'value': from };
        eventTarget.removeAll('done');
        tween(data).to(tweenSec, { value: to }, { onUpdate: onUpdate, onComplete: ()=> eventTarget.emit('done') }).start();

        return Utils.delayEvent(eventTarget);
    }

    public setTotalBet(totalBet:number) {
        const totalBetLabel:Label = this.props['ui']['totalBet'][DATE_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;

        this.props['ui']['totalBet']['lastValue'] = totalBet;
        totalBetLabel.string = `${currencySymbol} ${Utils.numberComma(totalBet)}`;
    }

    public set betIdx(value:number) { this.props['ui']['totalBet']['betIdx'] = value; }
    public get betIdx() { return this.props['ui']['totalBet']['betIdx']; }
    public get betValue() { 
        const [ coinValue, lineBet, lineTotal ] = [
            gameInformation.coinValueArray[this.betIdx],
            gameInformation.lineBet,
            gameInformation.lineTotal
        ];

        return coinValue * 1000 * lineBet * lineTotal / 1000;
    }

    public get totalBet() { return this.betValue; }

    public get betIdxLength() { return gameInformation.coinValueArray.length; }

    public refreshTotalBet() { /*this.setTotalBet(this.betValue);*/ this.changeTotalBet(this.betValue); }

    // #endregion 數值畫面功能


}

