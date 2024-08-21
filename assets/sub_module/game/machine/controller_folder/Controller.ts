import { _decorator, Component, Node, sys, Button, EventTarget, Vec3, tween, Color, Sprite, Label, input, Input, EventKeyboard, KeyCode } from 'cc';
import { Utils, DATA_TYPE }         from '../../../utils/Utils';
import { Orientation, Viewport }    from '../../../utils/Viewport';
import { AutoSpin }                 from '../../AutoSpin';
import { Machine }                  from '../Machine';
import { gameInformation }          from '../../GameInformation';
import { DataManager }              from '../../../data/DataManager';
import { GameInformation }          from '../GameInformation';
import { BuyFeatureGameUI }         from '../BuyFeatureGameUI';
import { SoundManager, PLAY_MODE }  from '../SoundManager';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {

    private initData = {
        "buttons" : {
            'TotalBetIncrease'  : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Total Bet/Increase',         [DATA_TYPE.CLICK_EVENT]: this.clickTotalBetIncrease, 'busyDisable':true, 'buttonSound':true },
            'TotalBetDecrease'  : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Total Bet/Decrease',         [DATA_TYPE.CLICK_EVENT]: this.clickTotalBetDecrease, 'busyDisable':true, 'buttonSound':true  },
            'Information'       : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Information', [DATA_TYPE.CLICK_EVENT]: this.clickInformation,      'busyDisable':true, 'buttonSound':true  },
            'Option'            : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Option',      [DATA_TYPE.CLICK_EVENT]: this.clickOption,           'busyDisable':true, 'buttonSound':true  },
            'SpeedMode'         : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Speed',       [DATA_TYPE.CLICK_EVENT]: this.clickSpeedMode,        'busyDisable':true, 'buttonSound':true  },
            'AutoSpin'          : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Auto',        [DATA_TYPE.CLICK_EVENT]: this.clickAutoSpin,         'busyDisable':true, 'buttonSound':true  },
            'InGameMenu'        : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Buttons/InGameMenu',  [DATA_TYPE.CLICK_EVENT]: this.clickInGameMenu,       'busyDisable':true, 'buttonSound':true  },
            'Record'            : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Buttons/Record',      [DATA_TYPE.CLICK_EVENT]: this.clickRecord,           'busyDisable':true, 'buttonSound':true  },
            'Fullscreen'        : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Buttons/Screen',      [DATA_TYPE.CLICK_EVENT]: this.clickFullscreen,       'busyDisable':true, 'buttonSound':true  },
            'OptionBack'        : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Buttons/Back',        [DATA_TYPE.CLICK_EVENT]: this.clickOptionBack,       'busyDisable':true, 'buttonSound':true  },
            'Spin'              : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Spin',        [DATA_TYPE.CLICK_EVENT]: this.clickSpin,             'busyDisable':true, 'buttonSound':false  },
            'Sound'             : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Buttons/Sound',       [DATA_TYPE.CLICK_EVENT]: this.clickSound,            'busyDisable':true, 'buttonSound':false  },

            // ====== 橫版按鈕 ======
            'OptionLandscape'   : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Landscape/Option',             [DATA_TYPE.CLICK_EVENT]: this.clickOption,     'busyDisable':true, 'buttonSound':true  },
            'RecordLandscape'   : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Record',     [DATA_TYPE.CLICK_EVENT]: this.clickRecord,     'busyDisable':true, 'buttonSound':true  },
            'SoundLandscape'    : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound',      [DATA_TYPE.CLICK_EVENT]: this.clickSound,      'busyDisable':true, 'buttonSound':false  },
            'InGameMenuLandscape':{ [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/InGameMenu', [DATA_TYPE.CLICK_EVENT]: this.clickInGameMenu, 'busyDisable':true, 'buttonSound':true  },
            'ScreenLandscape'   : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Screen',     [DATA_TYPE.CLICK_EVENT]: this.clickFullscreen, 'busyDisable':true, 'buttonSound':true  },
            'INIT_EVENT'        : this.initButton
        },

        'fullScreen' : {
            'fullscreen_p'      : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Screen/FullScreen', },
            'fullscreen_exit_p' : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Screen/FullScreen Off', },
            'fullscreen_l'      : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Screen/FullScreen', },
            'fullscreen_exit_l' : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Screen/FullScreen Off', },
        },

        'soundMode_p' : {
            'content'           : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Sound', },   
            'all_on'            : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Sound/Sound',     'next':'music_off' },
            'music_off'         : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Sound/Music Off', 'next':'sound_off' },
            'sound_off'         : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Buttons/Sound/Sound Off', 'next':'all_on' },
        },

        'soundMode_l' : {
            'content'           : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound', },
            'all_on'            : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound/Sound',     'next':'music_off' },
            'music_off'         : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound/Music Off', 'next':'sound_off' },
            'sound_off'         : { [DATA_TYPE.TYPE] : Node,          [DATA_TYPE.NODE_PATH] : 'Option Landscape/Content/Sound/Sound Off', 'next':'all_on' },
        },

        'speedMode' : {
            [Machine.SPIN_MODE.NORMAL] : { [DATA_TYPE.TYPE] : Sprite, [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Normal', 'next':Machine.SPIN_MODE.QUICK },
            [Machine.SPIN_MODE.QUICK]  : { [DATA_TYPE.TYPE] : Sprite, [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Quick',  'next':Machine.SPIN_MODE.TURBO },
            [Machine.SPIN_MODE.TURBO]  : { [DATA_TYPE.TYPE] : Sprite, [DATA_TYPE.NODE_PATH] : 'Bottom Buttons/Speed/Turbo',  'next':Machine.SPIN_MODE.NORMAL},
        },

        'ui' : {
            'balance' : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Balance/Value',   'lastValue' : 0, },      // 顯示餘額
            'totalBet': { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Total Bet/Value', 'lastValue' : 0,  },    // 顯示總押注
            'totalWin': { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Total Win/Value', 'lastValue' : 0, },    // 顯示總贏分
            'mask'    : { // 共用遮罩
                [DATA_TYPE.TYPE] : Sprite,
                [DATA_TYPE.NODE_PATH] : '---- Common Mask ----',
                'alpha' : 200,          // 遮罩透明度
                'event' : null,         // 遮罩事件
                'tweenSec' : 0.3,       // 遮罩動畫時間
            },
            'INIT_EVENT' : this.initUIValue,
        },

        'optionButtons' : { // Option 按鈕
            'portraitBottom' : { [DATA_TYPE.TYPE]: Node, [DATA_TYPE.NODE_PATH]: 'Bottom Buttons' },
            'portraitOption' : { [DATA_TYPE.TYPE]: Node, [DATA_TYPE.NODE_PATH]: 'Option Buttons' },
            'landscapeOption': { [DATA_TYPE.TYPE]: Node, [DATA_TYPE.NODE_PATH]: 'Option Landscape/Content' },
        },

        'autoSpin' : {
            'button'        : { [DATA_TYPE.TYPE]: Button, [DATA_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/AutoSpin', [DATA_TYPE.CLICK_EVENT]: AutoSpin.StopAutoSpin },
            'label'         : { [DATA_TYPE.TYPE]: Label,  [DATA_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/AutoSpin/Label' },
        },

        'spin' : {
            'image'         : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/Image' },
            'stop'          : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/Stop' },
            'free'          : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.NODE_PATH]: 'Bottom Buttons/Spin/Free' },
        },
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
                'fromPos'    : new Vec3(0, -500, 0),
                'toPos'      : new Vec3(0, 0,  0),
                'active'     : false,
                'running'    : false,
            },
        },
        
        'clickSpin' : [0,0], // Spin 次數, SpinStop 次數
    };

    get autoSpinButton() { return this.properties['autoSpin']['button'][DATA_TYPE.COMPONENT]; }
    get autoSpinLabel()  { return this.properties['autoSpin']['label'][DATA_TYPE.COMPONENT]; }

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
            const button = data[DATA_TYPE.COMPONENT];
            if ( button == null ) continue;
            busyDisableButtons.push(button);
        }
        this.props['BusyDisableButtons'] = busyDisableButtons;
    }

    private iphoneDisableFullScreen() : boolean {
        if ( sys.isMobile === false ) return false;
        if ( sys.os !== 'iOS' )       return false;

        const fullScreen = this.props['fullScreen'];
        fullScreen['fullscreen_p'][DATA_TYPE.NODE].active = false;
        fullScreen['fullscreen_exit_p'][DATA_TYPE.NODE].active = false;
        fullScreen['fullscreen_l'][DATA_TYPE.NODE].active = false;
        fullScreen['fullscreen_exit_l'][DATA_TYPE.NODE].active = false;
        fullScreen['fullscreen_p'][DATA_TYPE.NODE].parent.active = false;
        fullScreen['fullscreen_l'][DATA_TYPE.NODE].parent.active = false;

        this.props['soundMode_p']['content'][DATA_TYPE.NODE].setPosition(115, 10, 0);
        this.props['buttons']['Record'][DATA_TYPE.NODE].setPosition(-90, 10, 0);
        this.props['buttons']['InGameMenuLandscape'][DATA_TYPE.NODE].setPosition(0, 90, 0);

        return true;
    }

    public addDisableButtons(button:Button) { this.props['BusyDisableButtons'].push(button); }

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
        optionData[Orientation.PORTRAIT]['fromPos'] = new Vec3(optionButtons['portraitOption'][DATA_TYPE.NODE].position);
        optionData[Orientation.PORTRAIT]['toPos']   = new Vec3(optionButtons['portraitBottom'][DATA_TYPE.NODE].position);
    }

    // #region [[rgba(0, 0, 0, 0)]] 遮罩相關功能
    /**
     * 初始化遮罩
     */
    private initMask() {
        this.props.ui.mask['event']  = new EventTarget();
        this.props.ui.mask[DATA_TYPE.NODE].active = false;
    }

    /**
     * 遮罩開啟/關閉
     * @param active     {boolean} 開啟/關閉
     * @param awaitEvent {boolean} 是否等待事件完成, 預設為不等待
     */
    public async maskActive(active:boolean) {
        const maskData = this.props.ui.mask;
        const [sprite, fadeIn, event, tweenSec ] = [maskData[DATA_TYPE.COMPONENT], maskData['alpha'], maskData['event'], maskData['tweenSec']];
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

    public static MaskActive(active:boolean) { return Controller.Instance?.maskActive(active); }

    // #endregion 遮罩

    /**
     * 啟用/禁用所有按鈕
     * @param active 啟用/禁用
     */
    public activeBusyButtons(active:boolean) { 
        this.props['BusyDisableButtons'].forEach((button: Button) => { button.interactable = active; }); 
        this.machine.activeBuyFGButton(active);
        BuyFeatureGameUI.CloseUI();
    }

    protected onLoad(): void {
        Controller.Instance = this;
        this.props['machine'] = Machine.Instance;

        Utils.initData(this.initData, this);
        this.initMask();
        this.initOptionButton();
        this.initSoundMode();
        input.on(Input.EventType.KEY_DOWN, this.onKeySpaceDown, this);
    }

    /**
     * 按鍵設定
     * @todo 空白鍵進行 Spin
     */
    protected onKeySpaceDown(event: EventKeyboard) { 
        if ( event.keyCode !== KeyCode.SPACE ) return;
        AutoSpin.StopAutoSpin();
        this.clickSpin();
    }

    protected start() {
        this.changeSpeedMode(this.machine.SpeedMode);
        this.iphoneDisableFullScreen();
    }

    public get machine() :Machine { return this.props['machine']; }

    public spinButtonEvent : EventTarget = new EventTarget();
    public async buttonSpinning(active:boolean=true) {
        if ( this.machine.featureGame ) return;

        const spinImage = this.props['spin']['image'].node;
        const stopImage = this.props['spin']['stop'].node;

        if ( active === false ) return this.spinButtonEvent.emit('done');
        if ( this.spinButtonEvent['running'] ) return;
    
        Utils.commonFadeIn(spinImage, true);
        this.spinButtonEvent['tween'] = tween(spinImage).repeatForever(tween().by(0.5, { angle: -360 }, { easing:'linear' })).start();
        this.spinButtonEvent['running'] = true;
        await Utils.commonFadeIn(stopImage, false);
        spinImage.active = false;
        stopImage.active = true;
        this.props['spin']['stop'].component.color = Color.WHITE;
    
        await Utils.delayEvent(this.spinButtonEvent);
        Utils.commonFadeIn(spinImage, false);
        Utils.commonFadeIn(stopImage, true);
        this.spinButtonEvent['tween'].stop();
        this.spinButtonEvent['running'] = false;
    }

    public static ActiveFreeGameButton(active:boolean) { Controller.Instance.activeFreeGameButton(active); }

    public activeFreeGameButton(active:boolean) {
        this.props['spin']['free'].node.active = active; 
        this.props['spin']['image'].node.active = false;
        this.props['spin']['stop'].node.active = !active;

        const label = AutoSpin.Instance.autoSpinTimeLabel;
        if ( active === true ) {
            label.node.setPosition(0, 5, 0);
        } else {
            label.node.setPosition(0, 0, 0);
            label.string = '';
        }
    }

    public static async ButtonSpinning(active:boolean) { 
        if ( active ) return Controller.Instance.buttonSpinning();
        return Controller.Instance.spinButtonEvent.emit('done'); 
    }

    private async clickSpinButtonAnimation() {
        const spinImage = this.props['spin']['image'].node.parent;
        tween(spinImage).to(0.1, { scale: new Vec3(0.6,0.6,1) }).to(0.15, { scale: Vec3.ONE }, {easing:'backOut'}).start();
    }

    /**
     * Spin 按鈕事件
     */
    public async clickSpin(autoSpin:boolean=false) {

        if ( this.machine.featureGame ) return false;   // 如果在特色遊戲中, 則不可SPIN
        this.clickSpinButtonAnimation() ;               // SPIN 按鈕點擊動畫
        if ( this.machine.spinning ) {                  // 正在 SPIN 中
            if ( this.machine.fastStopping ) return false; // 已經是快速停止狀態，不做任何事

            let times = this.props['clickSpin'][1]++;   // 紀錄快停次數
            Utils.GoogleTag('ClickSpinStop', {'event_category':'Spin', 'event_label':'ClickSpinStop'});
            this.machine.fastStopping = true;           // 設定快速停止狀態
            return false;
        }

        let times = this.props['clickSpin'][0]++;       // 紀錄 SPIN 次數
        Utils.GoogleTag('ClickSpin', {'event_category':'Spin', 'event_label':'ClickSpin', 'value':this.betIdx});

        this.clickOption(null, false);                  // 關閉 Option 功能
        await this.machine.clickSpin();                 // 等待 Spin 結束
        await this.autoSpin.decrementCount();           // 如果有 AutoSpin 則繼續
        return true;
    }

    protected clickInformation() {
        if ( this.machine.isBusy === true ) return; 
        Utils.GoogleTag('ClickInformation', {'event_category':'Information', 'event_label':'ClickInformation'});
        GameInformation.OpenUI();
    }

    /**
     * 切換顯示 Option 按鈕列表功能
     * @param active 切換按鈕狀態, 預設為反向
     */
    protected clickOption(event, active:boolean=null) {
        if ( this.machine.isBusy === true && active !== false ) return; 

        const orientation = Viewport.instance.getCurrentOrientation();
        const optionData  = this.props['OptionData'][orientation];
        const optionButtons = this.props['optionButtons'];
        let [ oFromPos, oToPos, isActive, running ] = [ optionData['fromPos'], optionData['toPos'], optionData['active'], optionData['running'], optionData['bottomNode'] ];
        
        const node       = (orientation === Orientation.PORTRAIT) ? optionButtons['portraitOption'][DATA_TYPE.NODE] : optionButtons['landscapeOption'][DATA_TYPE.NODE];
        const bottomNode = (orientation === Orientation.PORTRAIT) ? optionButtons['portraitBottom'][DATA_TYPE.NODE] : null;

        if ( node    == null )      return console.error('Option Node is null', optionData);
        if ( running === true )     return;
        if ( active  === isActive ) return;
        active = !isActive;
        
        const fromPos = active ? oFromPos : oToPos;
        const toPos   = active ? oToPos : oFromPos;
        const self    = this;
        running       = true;

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
    public clickOptionBack() { return this.clickOption(null, false); }

    /**
     * 點擊切換速度模式
     */
    protected clickSpeedMode() {
        if ( this.machine.isBusy === true ) return; 
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        const nextMode = speedMode[lastMode]['next'];

        Utils.GoogleTag('ClickSpeedMode', {'event_category':'SpeedMode', 'event_label':'ClickSpeedMode', 'value':nextMode});
        return this.changeSpeedMode(nextMode);
    }

    /**
     * 切換速度模式
     * @param mode { Machine.SPIN_MODE } 速度模式代號
     */
    private changeSpeedMode(mode:number) {
        const speedMode = this.props.speedMode;
        const lastMode = this.machine.SpeedMode;
        if ( lastMode === mode ) return;

        speedMode[mode][DATA_TYPE.NODE].active = true;
        speedMode[lastMode][DATA_TYPE.NODE].active = false;

        return this.machine.setSpeedMode(mode);
    }

    public static ChangeSpeedMode(mode:number) { return Controller.Instance.changeSpeedMode(mode); }

    protected clickAutoSpin() { 
        if ( this.machine.isBusy === true ) return; 
        AutoSpin.OpenUI(); 
    }

    protected clickInGameMenu() {
        if ( this.machine.isBusy === true ) return; 
        Utils.GoogleTag('ClickInGameMenu', {'event_category':'InGameMenu', 'event_label':'ClickInGameMenu'});
    }

    protected clickRecord() {
        if ( this.machine.isBusy === true ) return; 
        Utils.GoogleTag('ClickBetRecord', {'event_category':'BetRecord', 'event_label':'ClickBetRecord'});
        const betrecordurl = gameInformation.fullBetrecordurl;
        window.open(betrecordurl, '_blank');
    }

    protected initSoundMode() {
        this.props['soundMode'] = {};
        this.props['soundMode'][Orientation.LANDSCAPE] = {};
        this.props['soundMode'][Orientation.PORTRAIT]  = {};

        this.props['soundMode'][Orientation.LANDSCAPE][PLAY_MODE.NORMAL]     = this.props['soundMode_l']['all_on'].node;
        this.props['soundMode'][Orientation.LANDSCAPE][PLAY_MODE.ONLY_SOUND] = this.props['soundMode_l']['music_off'].node;
        this.props['soundMode'][Orientation.LANDSCAPE][PLAY_MODE.NO_SOUND]   = this.props['soundMode_l']['sound_off'].node;

        this.props['soundMode'][Orientation.PORTRAIT][PLAY_MODE.NORMAL]      = this.props['soundMode_p']['all_on'].node;
        this.props['soundMode'][Orientation.PORTRAIT][PLAY_MODE.ONLY_SOUND]  = this.props['soundMode_p']['music_off'].node;
        this.props['soundMode'][Orientation.PORTRAIT][PLAY_MODE.NO_SOUND]    = this.props['soundMode_p']['sound_off'].node;
    }

    protected changeSoundMode(mode:PLAY_MODE) {
        for(let i=0;i<PLAY_MODE.length;i++) {
            const active = (mode === i);
            this.props['soundMode'][Orientation.LANDSCAPE][i].active = active;
            this.props['soundMode'][Orientation.PORTRAIT][i].active = active;
        }

        SoundManager.setMode(mode);
        Utils.GoogleTag('ChangeSoundMode', {'event_category':'soundMode', 'event_label':'ChangeSoundMode', 'value':mode});
    }

    protected clickSound() {
        if ( this.machine.isBusy === true ) return; 
        let mode = SoundManager.Mode + 1;
        if ( mode >= PLAY_MODE.length ) mode = 0;

        this.changeSoundMode(mode);
    }

    protected clickFullscreen() {
        if ( this.machine.isBusy === true ) return; 
        const isFullScreen = this.machine.isFullScreen;

        this.props['fullScreen']['fullscreen_p'][DATA_TYPE.NODE].active      = isFullScreen;
        this.props['fullScreen']['fullscreen_exit_p'][DATA_TYPE.NODE].active = !isFullScreen;
        this.props['fullScreen']['fullscreen_l'][DATA_TYPE.NODE].active      = isFullScreen;
        this.props['fullScreen']['fullscreen_exit_l'][DATA_TYPE.NODE].active = !isFullScreen;
        this.machine.fullscreen(!isFullScreen);
        Utils.GoogleTag('ClickFullScreen', {'event_category':'FullScreen', 'event_label':'ClickFullScreen', 'value':+!isFullScreen});
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
        const balanceLabel:Label = this.props['ui']['balance'][DATA_TYPE.COMPONENT];
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
     * 累加總贏分 (非同步)
     * @param value 
     * @returns 
     */
    public async addTotalWin(value:number) {
        const totalWin = this.props['ui']['totalWin']['lastValue'];
        return await this.changeTotalWin(totalWin + value);
    }

    /**
     * 顯示總贏分
     * @param totalWin 顯示總贏分
     * @returns { void }
     */

    public setTotalWin(totalWin:number) {
        
        const totalWinLabel:Label = this.props['ui']['totalWin'][DATA_TYPE.COMPONENT];
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
        const totalBetLabel:Label = this.props['ui']['totalBet'][DATA_TYPE.COMPONENT];
        const currencySymbol = gameInformation._currencySymbol;

        this.props['ui']['totalBet']['lastValue'] = totalBet;
        totalBetLabel.string = `${currencySymbol} ${Utils.numberComma(totalBet)}`;
    }

    /**  設定押注Index (private) */
    private set betIdx(value:number) { this.props['ui']['totalBet']['betIdx'] = value; }

    /**  取得押注Index */
    public get betIdx() { return this.props['ui']['totalBet']['betIdx']; }

    /**  取得押注額度 */
    private get betValue() { return this.calculateTotalBet(this.betIdx);}

    public calculateTotalBet(idx:number) {
        const paytableTotalBet = this.machine.paytable?.calculateTotalBet(idx);
        if ( paytableTotalBet != null ) return paytableTotalBet;

        const [ coinValue, lineBet, lineTotal ] = [
            gameInformation.coinValueArray[idx],
            gameInformation.lineBet,
            gameInformation.lineTotal
        ];
        gameInformation.coinValue = coinValue;
        return coinValue * 1000 * lineBet * lineTotal / 1000;
    }

    /**  取得總押注 */
    public get totalBet() { return this.betValue; }

    /**  取得押注額度數量 */
    private get betIdxLength() { return gameInformation.coinValueArray.length; }
    private get betIdxMin() { return gameInformation.bet_available_idx; }

    /**  更新押注額 */
    public refreshTotalBet() { this.changeTotalBet(this.betValue); }

    /**  減少押注 */
    protected clickTotalBetDecrease() { 
        if ( this.machine.isBusy === true ) return; 
        this.changeTotalBetIdx(this.betIdx - 1); 
    }

    /**  增加押注 */
    protected clickTotalBetIncrease() { 
        if ( this.machine.isBusy === true ) return; 
        this.changeTotalBetIdx(this.betIdx + 1);
     }

    /** 
     * 改變押注 
     * @param idx {number} 指定押注Index
     */
    public changeTotalBetIdx(idx:number) {
        
        const length = this.betIdxLength;

        if ( idx >= length ) idx = this.betIdxMin;
        if ( idx < this.betIdxMin ) idx = length - 1;
        this.betIdx = idx;
        this.refreshTotalBet();
        this.machine.eventChangeTotalBet();
        this.machine.paytable.changeTotalBet(this.totalBet);
    }

    public displayTotalBetIdx(idx:number) {
        const length = this.betIdxLength;
        if ( idx >= length ) idx = length-1;
        if ( idx < this.betIdxMin ) idx = this.betIdxMin;

        const totalBet = this.calculateTotalBet(idx);
        this.changeTotalBet(totalBet);
        return totalBet;
    }

    //#endregion TotalBet 相關功能

}