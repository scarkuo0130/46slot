import { _decorator, Component, Node, game, Button, EventTarget, Vec3, tween, Color, Sprite } from 'cc';
import { Utils } from '../../../utils/Utils';
import { Orientation, Viewport } from '../../../utils/Viewport';
const { ccclass, property } = _decorator;

export enum BUTTON_DATA_TYPE {
    PATH = 0,
    EVENT = 1,
    BUSY_DISABLE = 2,
}

@ccclass('Controller2_0')
export class Controller2_0 extends Component {

    /**
     * 初始化按鈕資料
     * PATH: 按鈕路徑
     * EVENT: 按鈕事件
     * BUSY_DISABLE: 是否在忙碌時禁用按鈕
     */
    protected InitButtonData = {
        // ====== 直版按鈕 ======
        'TotalBetIncrease'  : { [BUTTON_DATA_TYPE.PATH] : 'Total Bet/Increase',         [BUTTON_DATA_TYPE.EVENT] : this.clickTotalBetIncrease,  [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'TotalBetDecrease'  : { [BUTTON_DATA_TYPE.PATH] : 'Total Bet/Decrease',         [BUTTON_DATA_TYPE.EVENT] : this.clickTotalBetDecrease,  [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Information'       : { [BUTTON_DATA_TYPE.PATH] : 'Bottom Buttons/Information', [BUTTON_DATA_TYPE.EVENT] : this.clickInformation,       [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Option'            : { [BUTTON_DATA_TYPE.PATH] : 'Bottom Buttons/Option',      [BUTTON_DATA_TYPE.EVENT] : this.clickOption,            [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'SpeedMode'         : { [BUTTON_DATA_TYPE.PATH] : 'Bottom Buttons/Speed',       [BUTTON_DATA_TYPE.EVENT] : this.clickSpeedMode,         [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'AutoSpin'          : { [BUTTON_DATA_TYPE.PATH] : 'Bottom Buttons/Auto',        [BUTTON_DATA_TYPE.EVENT] : this.clickAutoSpin,          [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'InGameMenu'        : { [BUTTON_DATA_TYPE.PATH] : 'Option Buttons/InGameMenu',  [BUTTON_DATA_TYPE.EVENT] : this.clickInGameMenu,        [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Record'            : { [BUTTON_DATA_TYPE.PATH] : 'Option Buttons/Record',      [BUTTON_DATA_TYPE.EVENT] : this.clickRecord,            [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Fullscreen'        : { [BUTTON_DATA_TYPE.PATH] : 'Option Buttons/Screen',      [BUTTON_DATA_TYPE.EVENT] : this.clickFullscreen,        [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'OptionBack'        : { [BUTTON_DATA_TYPE.PATH] : 'Option Buttons/Back',        [BUTTON_DATA_TYPE.EVENT] : this.clickOptionBack,        [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Spin'              : { [BUTTON_DATA_TYPE.PATH] : 'Bottom Buttons/Spin',        [BUTTON_DATA_TYPE.EVENT] : this.clickSpin,              [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'Sound'             : { [BUTTON_DATA_TYPE.PATH] : 'Option Buttons/Sound',       [BUTTON_DATA_TYPE.EVENT] : this.clickSound,             [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        
        // ====== 橫版按鈕 ======
        'OptionLandscape'   : { [BUTTON_DATA_TYPE.PATH] : 'Option Landscape/Option',            [BUTTON_DATA_TYPE.EVENT] : this.clickOption,            [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'RecordLandscape'   : { [BUTTON_DATA_TYPE.PATH] : 'Option Landscape/Content/Record',    [BUTTON_DATA_TYPE.EVENT] : this.clickRecord,            [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'SoundLandscape'    : { [BUTTON_DATA_TYPE.PATH] : 'Option Landscape/Content/Sound',     [BUTTON_DATA_TYPE.EVENT] : this.clickSound,             [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'InGameMenuLandscape':{ [BUTTON_DATA_TYPE.PATH] : 'Option Landscape/Content/InGameMenu',[BUTTON_DATA_TYPE.EVENT] : this.clickInGameMenu,        [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
        'ScreenLandscape'   : { [BUTTON_DATA_TYPE.PATH] : 'Option Landscape/Content/Screen',    [BUTTON_DATA_TYPE.EVENT] : this.clickFullscreen,        [BUTTON_DATA_TYPE.BUSY_DISABLE]: true, },
    };

    /**
     * 
     */
    protected properties = {
        // Option 按鈕資料
        'OptionButtons' : { // 點擊 Option 按鈕後的選項設定
            [Orientation.PORTRAIT] : { // 直版
                'bottomPath' : 'Bottom Buttons',
                'bottomNode' : null,
                'path'       : 'Option Buttons',
                'node'       : null,
                'fromPos'    : new Vec3(0, 240, 0),
                'toPos'      : new Vec3(0, -60, 0),
                'active'     : false,
                'running'    : false,
            },

           [Orientation.LANDSCAPE] : {
                'path'       : 'Option Landscape/Content',
                'node'       : null,
                'fromPos'    : new Vec3(0, -520, 0),
                'toPos'      : new Vec3(0, -50,  0),
                'active'     : false,
                'running'    : false,
            },
        },
        // 忙碌時禁用按鈕
        'BusyDisableButtons' : [],

        // 共用遮罩
        'Mask' : {
            'node'   : null,
            'active' : false,
            'sprite' : null,
            'path'   : '---- Common Mask ----',
            'alpha'  : 200,
            'event'  : null,
        }
    };

    private static Instance: Controller2_0 = null;

    /**
     * 初始化按鈕
     * @todo 1. 透過 InitButtonData 初始化按鈕
     * @todo 2. 透過 InitButtonData 設定按鈕小手指標
     */
    private initButton() {
        let keys = Object.keys(this.InitButtonData);
        for(let i=0;i<keys.length;i++) {
            let data    = this.InitButtonData[keys[i]];
            let button  = this.node.getChildByPath(data[BUTTON_DATA_TYPE.PATH]);
            if ( button == null ) return console.error('Button is null', data[BUTTON_DATA_TYPE.PATH]);

            button.on('click', data[BUTTON_DATA_TYPE.EVENT], this);
            Utils.AddHandHoverEvent(button);

            if ( data[BUTTON_DATA_TYPE.BUSY_DISABLE] ) {
                this.properties['BusyDisableButtons'].push(button.getComponent(Button));
            }
        }
    }

    /**
     * 初始化 Option 按鈕
     */
    private initOptionButton() {
        let optionData = this.properties['OptionButtons'];
        optionData[Orientation.PORTRAIT]['node']  = this.node.getChildByPath(optionData[Orientation.PORTRAIT]['path']);
        optionData[Orientation.PORTRAIT]['bottomNode'] = this.node.getChildByPath(optionData[Orientation.PORTRAIT]['bottomPath']);
        optionData[Orientation.PORTRAIT]['fromPos'] = new Vec3(optionData[Orientation.PORTRAIT]['node'].position);
        optionData[Orientation.PORTRAIT]['toPos'] = new Vec3(optionData[Orientation.PORTRAIT]['bottomNode'].position);
        optionData[Orientation.LANDSCAPE]['node'] = this.node.getChildByPath(optionData[Orientation.LANDSCAPE]['path']);
    }

    // #region [[rgba(0, 0, 0, 0)]] 遮罩相關功能
    /**
     * 初始化遮罩
     */
    private initMask() {
        this.properties['Mask']['node']   = this.node.getChildByPath(this.properties['Mask']['path']);
        this.properties['Mask']['sprite'] = this.properties['Mask']['node'].getComponent(Sprite);
        this.properties['Mask']['alpha']  = this.properties['Mask']['sprite'].color.a;
        this.properties['Mask']['event']  = new EventTarget();
        this.properties['Mask']['node'].active = false;
    }

    /**
     * 遮罩開啟/關閉
     * @param active     {boolean} 開啟/關閉
     * @param awaitEvent {boolean} 是否等待事件完成, 預設為不等待
     */
    public async maskActive(active:boolean) {
        let maskData = this.properties['Mask'];
        let [sprite, fadeIn,event ] = [maskData['sprite'], maskData['alpha'], maskData['event']];
        
        event.removeAll('done');
        let fromAlpha = active ? 0 : fadeIn;
        let toAlpha   = active ? fadeIn : 0;
        let data      = { 'value': fromAlpha };

        sprite.node.active = true;
        sprite.color = new Color(0, 0, 0, fromAlpha);
        tween(data).to(0.3, { value: toAlpha }, {
            onUpdate:   ()=>{ sprite.color = new Color(0, 0, 0, data['value']); },
            onComplete:(n)=>{ event.emit('done'); }
        }).start();

        await Utils.delayEvent(event);
    }
    // #endregion 遮罩

    /**
     * 啟用/禁用所有按鈕
     * @param active 啟用/禁用
     */
    private activeBusyButtons(active:boolean) { this.properties['BusyDisableButtons'].forEach((button: Button) => { button.interactable = active; }); }

    protected onLoad(): void {
        Controller2_0.Instance = this;
        this.initButton();
        this.initOptionButton();
        this.initMask();
    }

    //region 按鈕事件 [[rgba(0, 0, 0, 0)]]

    /**
     * Spin 按鈕事件
     */
    protected async clickSpin() {

        console.log('clickSpin');
        this.clickOption(null, false); // 關閉 Option 功能
        // 通知 machine 開始 Spin
        // let waitEvent: EventTarget = this.machihe.spin();
        // 有取得 waitEvent 表示 machine 開始 Spin
        // if ( waitEvent == null ) return; 
        // 禁用所有按鈕
        this.activeBusyButtons(false);
        // 等待 Spin 結束
        // await Utils.delayEvent(waitEvent);

        await Utils.delay(1000); // 模擬等待時間

        // 啟用所有按鈕
        this.activeBusyButtons(true);
        
    }

    start() {
        console.log(this);
    }

    protected clickTotalBetDecrease() {
        console.log('clickTotalBetDecrease');
    }

    protected clickTotalBetIncrease() {
        console.log('clickTotalBetIncrease');
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
        let orientation = Viewport.instance.getCurrentOrientation();
        let optionData  = this.properties['OptionButtons'][orientation];
        let [ node, oFromPos, oToPos, isActive, running, bottomNode ] = [ optionData['node'], optionData['fromPos'], optionData['toPos'], optionData['active'], optionData['running'], optionData['bottomNode'] ];
        
        if ( node == null )         return console.error('Option Node is null', optionData);
        if ( running === true )     return;
        if ( active  === isActive ) return;
        active = !isActive;
        
        let fromPos = active ? oFromPos : oToPos;
        let toPos   = active ? oToPos : oFromPos;
        let self    = this;
        running     = true;

        this.activeBusyButtons(false);
        node.setPosition(new Vec3(fromPos));

        if ( bottomNode != null ) {
            bottomNode.setPosition(new Vec3(toPos));
            tween(bottomNode).to(0.3, { position: fromPos }, { easing:'backOut' }).start();
        }
        
        tween(node).to(0.3, { position: toPos }, { easing:'backOut', onComplete:(n)=>{
            optionData['running'] = false;
            optionData['active'] = active;
            self.activeBusyButtons(true);
        } }).start();
    }

    protected clickOptionBack() { return this.clickOption(null, false); }

    protected clickSpeedMode() {
        console.log('clickSpeedMode');
    }

    protected clickAutoSpin() {
        console.log('clickAutoSpin');
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
}

