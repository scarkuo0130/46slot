import { _decorator, Color, Button, Component, EventHandle, EventHandler, Label, Node, Quat, sp, Sprite, SpriteFrame, tween, UIOpacity } from 'cc';
import { Machine, MACHINE_STATE, MACHINE_STATUS } from './Machine';
import { SPIN_MODE } from './Reel_bak';
import { SoundManager, PLAY_MODE, SimbpleAudioClipData } from './SoundManager';
import { Game } from '../Game';
import { gameInformation } from '../GameInformation';
import { DataManager } from '../../data/DataManager';
import { Utils } from '../../utils/Utils';
import { ButtonUtils } from '../../utils/ButtonUtils';
import { UrlParameters } from '../../utils/UrlParameters';
import { switchButton } from '../../utils/SwitchButton/switchButton';
import { dropDown } from '../../utils/DropDown/dropDown';
import { EffectUtils } from '../../utils/EffectUtils';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

/**
 * 多國語言圖片顯示物件
 */
@ccclass( 'ControllerInscept/LanguageNode' )
export class LanguageNode {
    @property( { displayName: 'LanguageID', tooltip: '語言代號(en,ph...)' } )
    public id: string = '';

    @property( { type: [ Node ], displayName: 'DisplayNode', tooltip: '顯示物件' } )
    public nodes: Node[] = [];
}


@ccclass( 'ControllerInscept/SymbolBetLabel' )
export class SymbolBetLabel {
    @property( { displayName: 'SymbolID', tooltip: '圖標代號' } )
    public symbolID: number = 0;

    @property( { type: Label, displayName: 'Label', tooltip: 'Label' } )
    public label: Label;
}

@ccclass( 'ControllerInscept' )
export class ControllerInscept {

    @property( { type: Button, displayName: 'InfoButton', tooltip: 'Info按鈕', group: { name: 'GameInfo', id: '0' } } )
    public infoButton: Button;

    @property( { type: Node, displayName: 'GameInfoUI', tooltip: '遊戲說明介面', group: { name: 'GameInfo', id: '0' } } )
    public infoUINode: Node;

    @property( { type: [ Label ], displayName: 'VersionLabels', tooltip: '版號顯示', group: { name: 'GameInfo', id: '0' } } )
    public versionLabels: Label[] = [];

    @property( { type: [ SymbolBetLabel ], displayName: 'SymbolBetLabelList', tooltip: '顯示Symbol賠率的Label', group: { name: 'GameInfo', id: '0' } } )
    public symbolBetLabelList: SymbolBetLabel[] = [];

    //#region Spin Speed Mode Setting
    @property( { type: sp.Skeleton, displayName: 'SpinButtonSpine', tooltip: 'Spin按鈕Spine', group: { name: 'Spin', id: '0' } } )
    public spinButton: sp.Skeleton;

    @property( { type: Button, displayName: 'SpinModeButton', tooltip: 'Spin速度按鈕', group: { name: 'Spin', id: '0' } } )
    public modeButton: Button;

    @property( { type: Node, displayName: 'NormalIcon', tooltip: 'Normal 速度圖示', group: { name: 'Spin', id: '0' } } )
    public normalModeNode: Node;

    @property( { type: Node, displayName: 'QuickIcon', tooltip: 'Quick 速度圖示', group: { name: 'Spin', id: '0' } } )
    public quickModeNode: Node;

    @property( { type: Node, displayName: 'TurboIcon', tooltip: 'Turbo 速度圖示', group: { name: 'Spin', id: '0' } } )
    public turboModeNode: Node;

    //#endregion Spin Speed Mode Setting End

    @property( { type: Button, displayName: 'AutoButton', tooltip: 'Auto按鈕', group: { name: 'AutoSpin', id: '0' } } )
    public autoButton: Button;

    @property( { type: Node, displayName: 'AutoSpinUI', tooltip: 'AutoSpinUI', group: { name: 'AutoSpin', id: '0' } } )
    public autoSpinUI: Node;

    @property( { type: switchButton, displayName: 'SpinTimes SB', tooltip: 'AutoSpinUI上面的SpinTimes切換按鈕', group: { name: 'AutoSpin', id: '0' } } )
    public spinTimesSB: switchButton;

    @property( { type: dropDown, displayName: 'SpinTimes DropDown', tooltip: 'AutoSpinUI上面的SpinTimes下拉式選單', group: { name: 'AutoSpin', id: '0' } } )
    public spinTimesDP: dropDown;

    @property( { type: switchButton, displayName: 'QuickSpin SB', tooltip: 'AutoSpinUI上面的QuickSpin切換按鈕', group: { name: 'AutoSpin', id: '0' } } )
    public quickSpinSB: switchButton;

    @property( { type: switchButton, displayName: 'TurboSpin SB', tooltip: 'AutoSpinUI上面的TurboSpin切換按鈕', group: { name: 'AutoSpin', id: '0' } } )
    public turboSpinSB: switchButton;

    @property( { type: Label, displayName: 'AutoSpinTimesLabel', tooltip: 'AutoSpin顯示次數Label', group: { name: 'AutoSpin', id: '0' } } )
    public autoSpinTimesLabel: Label;

    //#region Option Setting
    @property( { type: Button, displayName: 'optionButton', tooltip: 'Option按鈕', group: { name: 'Option', id: '0' } } )
    public optionButton: Button;

    @property( { type: Node, displayName: 'OptionUI', tooltip: 'OptionUI', group: { name: 'Option', id: '0' } } )
    public optionUI: Node;

    @property( { type: Node, displayName: 'BottomUI', group: { name: 'Option', id: '0' } } )
    public bottomUI: Node;
    //#endregion Option Setting End

    //#region SoundPlayMode
    @property( { type: Node, displayName: 'NormalIcon', tooltip: '播放音樂音效圖示', group: { name: 'SoundPlayMode', id: '0' } } )
    public normalPlayModeNode: Node;

    @property( { type: Node, displayName: 'OnlySoundIcon', tooltip: '只播放音效圖示', group: { name: 'SoundPlayMode', id: '0' } } )
    public onlySoundPlayModeNode: Node;

    @property( { type: Node, displayName: 'NoSoundIcon', tooltip: '關閉音效圖示', group: { name: 'SoundPlayMode', id: '0' } } )
    public noSoundPlayModeNode: Node;

    //#endregion SoundPlayMode

    //#region fullScreen Setting
    @property( { type: Node, displayName: 'FullScreenIcon', tooltip: '全螢幕圖示', group: { name: 'FullScreen', id: '0' } } )
    public fullScreenNode: Node;

    @property( { type: Node, displayName: 'WindowIcon', tooltip: '視窗圖示', group: { name: 'FullScreen', id: '0' } } )
    public nonFfullScreenNode: Node;
    //#endregion fullScreen End

    @property( { type: [ LanguageNode ], displayName: 'LanguageDisplayList', tooltip: '多國語言顯示物件表', group: { name: 'UI', id: '0' } } )
    public languageList: LanguageNode[] = [];

    @property( { type: Label, displayName: 'BalanceLabel', group: { name: 'UI', id: '0' } } )
    public balanceLabel: Label;

    @property( { type: Label, displayName: 'TotalBet', group: { name: 'UI', id: '0' } } )
    public totalBetLabel: Label;

    @property( { type: Label, displayName: 'TotalWin', group: { name: 'UI', id: '0' } } )
    public totalWinLabel: Label;

    @property( { type: Label, displayName: 'LandscapeTotalWinLabel', tooltip: '橫版TotalWin', group: { name: 'UI', id: '0' } } )
    public landscapeTotalWinLabel: Label;

    /*
    @property({ type: Node, displayName: 'UINode', group: { name: 'ErrorUI', id: '0' } })
    public errorUINode: Node;

    @property({ type: Label, displayName: 'MessageLabel', group: { name: 'ErrorUI', id: '0' } })
    public errorUILabel: Label;*/

    @property( { type: sp.Skeleton, displayName: 'BuyFeatureGameSpine', tooltip: '購買FeatureGame的按鈕的Spine', group: { name: 'BuyFeatureGame', id: '0' } } )
    public buyFeatureGameButtonSkeleton: sp.Skeleton;
    @property( { type: Node, displayName: 'BuyFeatureButtonNode', tooltip: '購買FeatureGame的按鈕的Node', group: { name: 'BuyFeatureGame', id: '0' } } )
    public buyFeatureGameButtonNode: Node;

    @property( { type: SimbpleAudioClipData, displayName: 'PressBtnAudio', tooltip: '按鍵共用音效', group: { name: 'Audio', id: '0' } } )
    public pressBtnAudio: SimbpleAudioClipData;

    @property( { type: [ Node ], displayName: 'HoverHands', tooltip: '新增hover小手', group: { name: 'Button', id: '0' } } )
    public clickHoverNodes: Node[] = [];

    @property( { type: [ Button ], displayName: 'SpinCloseButtons', tooltip: '遊戲狀態改變要關閉的按鈕群', group: { name: 'Button', id: '0' } } )
    public spinActiveButtons: Button[] = [];

    @property( { type: Node, displayName: 'LandscapeOptionButton', tooltip: '橫版Option按鈕', group: { name: 'Button', id: '0' } } )
    public landscapeOptionButton: Node;

    @property( { type: Node, displayName: 'LandscapeOptionContainer', tooltip: '橫版Option按鈕功能群', group: { name: 'Button', id: '0' } } )
    public landscapeOptionContainer: Node;
}

export enum SPIN_ACTION {
    NORMAL = 0,
    SPIN = 1,
    SPECIAL = 2,
}

@ccclass( 'Controller' )
@disallowMultiple( true )
@menu( 'SlotMachine/Controller/controller' )
@help( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.k32cwajhiauk' )
export class Controller extends Component {
    @property( { type: ControllerInscept, displayName: 'ControllerSetting', tooltip: '控制器設定', group: { name: 'ControllerSetting', id: '100' } } )
    public controllerSetting: ControllerInscept = new ControllerInscept();

    /** Spin 速度模式圖示設定 */
    protected spinModeSpriteFrame: {};

    /** Spin 速度模式切換表 */
    protected changeSpinModeMap: {};

    /** SoundPlay Mode 切換表 */
    protected changeSoundPlayModeMap: {};

    /** 音效模式圖示切換表 */
    protected soundPlayModeSpriteFrame: {};

    /** 全螢幕圖示切換表 */
    protected fullScreenSpriteFrame: {};
    protected languageMapData: {};

    public optionUITweenPos = {};
    private machine: Machine;

    private _currencySymbol = '';   // 幣別代號
    private _betIdx = 0;            // 押注順位

    public get betIdx () { return this._betIdx; }
    public betValue ( idx: number ) { return gameInformation.coinValueArray[ idx ]; }

    public setMachine ( machine: Machine ) { this.machine = machine; }
    public get getMachine () { return this.machine; }
    public get spinButton () { return this.controllerSetting.spinButton; }

    public autoSpin: AutoSpin;

    protected onLoad (): void {
        this.controllerSetting.infoButton.node.on( Node.EventType.TOUCH_END, this.clickInfoButton, this );
        this.controllerSetting.modeButton.node.on( Node.EventType.TOUCH_END, this.clickModeButton, this );
        this.controllerSetting.autoButton.node.on( Node.EventType.TOUCH_END, this.clickAutoButton, this );
        this.controllerSetting.optionButton.node.on( Node.EventType.TOUCH_END, this.clickOptionButton, this );

        this.controllerSetting.infoUINode.active = false;
        this.controllerSetting.infoUINode.getChildByName( 'Mask' ).on( Node.EventType.TOUCH_END, this.clickCloseInfoButton, this )

        /// Spin 速度模式圖示設定
        this.spinModeSpriteFrame = {};
        this.spinModeSpriteFrame[ SPIN_MODE.NORMAL_MODE ] = this.controllerSetting.normalModeNode;
        this.spinModeSpriteFrame[ SPIN_MODE.QUICK_MODE ] = this.controllerSetting.quickModeNode;
        this.spinModeSpriteFrame[ SPIN_MODE.TURBO_MODE ] = this.controllerSetting.turboModeNode;


        /// Spin 速度模式切換表
        this.changeSpinModeMap = {};
        this.changeSpinModeMap[ SPIN_MODE.NORMAL_MODE ] = SPIN_MODE.QUICK_MODE;
        this.changeSpinModeMap[ SPIN_MODE.QUICK_MODE ] = SPIN_MODE.TURBO_MODE;
        this.changeSpinModeMap[ SPIN_MODE.TURBO_MODE ] = SPIN_MODE.NORMAL_MODE;

        /// SoundPlay Mode 切換表
        this.changeSoundPlayModeMap = {};
        this.changeSoundPlayModeMap[ PLAY_MODE.NORMAL ] = PLAY_MODE.NO_SOUND;
        this.changeSoundPlayModeMap[ PLAY_MODE.NO_SOUND ] = PLAY_MODE.ONLY_SOUND;
        this.changeSoundPlayModeMap[ PLAY_MODE.ONLY_SOUND ] = PLAY_MODE.NORMAL;

        this.soundPlayModeSpriteFrame = {};
        this.soundPlayModeSpriteFrame[ PLAY_MODE.NORMAL ] = this.controllerSetting.normalPlayModeNode;
        this.soundPlayModeSpriteFrame[ PLAY_MODE.NO_SOUND ] = this.controllerSetting.noSoundPlayModeNode;
        this.soundPlayModeSpriteFrame[ PLAY_MODE.ONLY_SOUND ] = this.controllerSetting.onlySoundPlayModeNode;

        /// 全螢幕設置
        this.fullScreenSpriteFrame = {};
        this.fullScreenSpriteFrame[ 1 ] = this.controllerSetting.nonFfullScreenNode;
        this.fullScreenSpriteFrame[ 0 ] = this.controllerSetting.fullScreenNode;

        this.controllerSetting.autoSpinUI.active = false;
        this.controllerSetting.optionUI.active = false;
        this.optionUITweenPos[ 0 ] = this.controllerSetting.bottomUI.getPosition();
        this.optionUITweenPos[ 1 ] = this.controllerSetting.optionUI.getPosition();

        this.initLauguageList();
        this.autoSpin = new AutoSpin();
        this.autoSpin.setController( this );
        this.controllerSetting.autoSpinTimesLabel.string = '';

        let evt = new EventHandler();
        evt.component = 'Controller';
        evt.handler = 'displayVerison';
        evt.target = this.node;

        Utils.getConfig( evt );
    }

    /**
     * 在設定的 label 顯示版號
     * @from this.onLoad() Utils.getConfig(CallbackEvent)
     * @returns 
     */
    public displayVerison ( config ) {
        if ( config == null ) return;
        if ( this.controllerSetting.versionLabels == null ) return;
        if ( this.controllerSetting.versionLabels.length === 0 ) return;

        let versionLabels = this.controllerSetting.versionLabels;
        let version = config[ "Version" ];
        for ( let i in versionLabels ) {
            versionLabels[ i ].string = version;
        }
    }

    start () {
        this.displayLanguage();
        this._currencySymbol = gameInformation._currencySymbol;
        this.showBalance( DataManager.instance.userData.credit );

        this._betIdx = gameInformation._coinValueDefaultIndex;
        this.showTotalBet();
        this.setTotelWin( 0 );
        this.initClickHoverHands();

        let nowMode: SPIN_MODE = this.machine.getSpinMode();
        if ( nowMode == null ) nowMode = SPIN_MODE.QUICK_MODE;
        this.changeSpinMode( nowMode );
    }

    /**
     * 處理物件在 Hover 事件上，顯示小手
     */
    protected initClickHoverHands () {
        if ( this.controllerSetting.clickHoverNodes == null ) return;
        if ( this.controllerSetting.clickHoverNodes.length === 0 ) return;

        let nodes = this.controllerSetting.clickHoverNodes;
        for ( let i in nodes ) {
            let btn = nodes[ i ].getComponent( Button );
            if ( btn == null ) ButtonUtils.setNodeEventOnHover( nodes[ i ] );
            else ButtonUtils.setButtonEventOnHover( btn );
        }
    }

    /**
     * 顯示多國語言控制器
     */
    private displayLanguage () {
        let lan = gameInformation.lang;

        if ( lan == null ) lan = 'en';
        if ( this.languageMapData[ lan ] == null ) lan = 'en';

        let nodes: Node[] = this.languageMapData[ lan ];
        nodes.forEach( n => { n.active = true } );
    }

    /** 預載多國語言的物件列表 */
    private initLauguageList () {
        if ( this.controllerSetting.languageList == null ) return;
        let listData = this.controllerSetting.languageList;
        this.languageMapData = {};

        for ( let i in listData ) {
            let data = listData[ i ];
            this.languageMapData[ data.id ] = data.nodes;
            data.nodes.forEach( n => { n.active = false; } );
        }
    }

    /**
     * 啟動 spin 或特殊其他狀態時，要關閉的按鈕與其他UI
     * @param active true: 開, false: 關
     */
    protected spinActiveItems ( active: boolean ) {

        /// 把正在打開的UI給關閉
        if ( active === false ) {
            let duration = 0.25;
            EffectUtils.close( this.controllerSetting.autoSpinUI, duration, 'backIn', false );

            if ( this.controllerSetting.optionUI.active === true ) {
                this.closeOptionUI();
            }

            this.activeLandscapeOption( false );
            ButtonUtils.setSpineOpacity( this.controllerSetting.buyFeatureGameButtonSkeleton, 51 );
        } else {
            ButtonUtils.setSpineOpacity( this.controllerSetting.buyFeatureGameButtonSkeleton, 255 );
        }

        if ( this.controllerSetting.buyFeatureGameButtonNode != null ) {
            this.controllerSetting.buyFeatureGameButtonNode.active = active;
        }

        /// 處理按鈕
        let buttons = this.controllerSetting.spinActiveButtons;
        if ( buttons == null ) return;
        if ( buttons.length === 0 ) return;

        for ( let i in buttons ) {
            if ( buttons[ i ] == null ) continue;
            buttons[ i ].interactable = active;
        }
    }


    /**
     * 變更 Spin 按鈕狀態
     * @param action 
     * @returns 
     */
    public spinButtonController ( action: SPIN_ACTION ) {
        let autoing = this.autoSpin.getActive;
        switch ( action ) {
            case SPIN_ACTION.NORMAL:
                if ( autoing === true ) return;
                this.spinActiveItems( true );
                return this.spinButton.setAnimation( 0, 'idle', true );

            case SPIN_ACTION.SPIN:

                if ( autoing === false ) {
                    this.spinButton.setAnimation( 0, 'play1', true );
                } else {
                    this.spinButton.setAnimation( 0, 'play2', true );
                    this.controllerSetting.autoSpinTimesLabel.string = this.autoSpin.getSpinTimes();
                }
                this.spinActiveItems( false );
                return;
            case SPIN_ACTION.SPECIAL:
                this.controllerSetting.autoSpinTimesLabel.string = '';
                this.spinActiveItems( false );
                return this.spinButton.setAnimation( 0, 'play3', true );
        }
    }
    /**
     * 隱欌不會移動的多國語系按鈕
     */
    public hideBuyFeatureGameButtonNode () {
        this.controllerSetting.buyFeatureGameButtonNode.active = false;
    }
    /** 點擊 Spin 按鈕 
    */
    public clickSpinButton () {
        if ( this.machine == null ) return;
        return this.machine.clickSpinButton();
    }

    /** 停止 Spin 事件 */
    public eventSpingStop () {
        this.checkSpinState( SPIN_ACTION.NORMAL );
    }

    /**
     * 點擊 Info 按鈕
     */
    protected clickInfoButton () {
        if ( this.machine != null ) {
            if ( this.machine.state != MACHINE_STATE.IDLE ) return;
            if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;
        }

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );

        let list = this.controllerSetting.symbolBetLabelList;
        list.forEach( ( d ) => { this.displaySymbolValue( d ); } );
    }

    protected displaySymbolValue ( data: SymbolBetLabel ) {
        if ( this.machine == null ) return;

        let array = this.machine.payTable.getPaytableSymbolValue( data.symbolID );
        let message = "";
        let max = array.length - 1;
        for ( let i = 0; i < array.length; i++ ) {
            if ( array[ i ] === 0 ) continue;
            message += Utils.numberCommaFloat( array[ i ] );
            if ( i < max ) message += "\n";
        }

        data.label.string = message;
    }

    /**
     * 關閉 Info 介面
     */
    protected clickCloseInfoButton () {
        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
    }

    protected clickInGameMenu () {
        InGameMenu?.openInGameMenu();
    }

    protected clickModeButton () {
        if ( this.machine == null ) return;
        if ( this.machine.state != MACHINE_STATE.IDLE ) return;
        if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;
        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );

        let nowMode = this.machine.getSpinMode();
        let nextMode = this.machine.setSpinMode( this.changeSpinModeMap[ nowMode ] );
        if ( nowMode === nextMode ) return;

        this.spinModeSpriteFrame[ SPIN_MODE.NORMAL_MODE ].active = false;
        this.spinModeSpriteFrame[ SPIN_MODE.QUICK_MODE ].active = false;
        this.spinModeSpriteFrame[ SPIN_MODE.TURBO_MODE ].active = false;
        this.spinModeSpriteFrame[ nextMode ].active = true;
    }


    /**
     * 變更Spin速度
     * @param spinMode 
     */
    protected changeSpinMode ( spinMode: SPIN_MODE ) {
        if ( this.spinModeSpriteFrame == null ) return;

        let nowMode = this.machine.getSpinMode();
        this.spinModeSpriteFrame[ nowMode ].active = false;

        this.machine.setSpinMode( spinMode );
        this.spinModeSpriteFrame[ spinMode ].active = true;

        switch ( spinMode ) {
            case SPIN_MODE.NORMAL_MODE:
                this.controllerSetting.quickSpinSB.switch( false );
                this.controllerSetting.turboSpinSB.switch( false );
                break;
            case SPIN_MODE.QUICK_MODE:
                this.controllerSetting.quickSpinSB.switch( true );
                this.controllerSetting.turboSpinSB.switch( false );
                break;
            case SPIN_MODE.TURBO_MODE:
                this.controllerSetting.quickSpinSB.switch( false );
                this.controllerSetting.turboSpinSB.switch( true );
                break;
        }
    }


    public autoSpinUISwitchQuickSpin () {
        console.log( 'autoSpinUISwitchQuickSpin step 1' );
        let nowMode = this.machine.getSpinMode();
        console.log( 'autoSpinUISwitchQuickSpin step 2', nowMode );
        switch ( nowMode ) {
            case SPIN_MODE.NORMAL_MODE:
            case SPIN_MODE.TURBO_MODE:
                return this.changeSpinMode( SPIN_MODE.QUICK_MODE );

            default:
                return this.changeSpinMode( SPIN_MODE.NORMAL_MODE );
        }
    }

    public autoSpinUISwitchTurboSpin () {
        let nowMode = this.machine.getSpinMode();
        switch ( nowMode ) {
            case SPIN_MODE.NORMAL_MODE:
            case SPIN_MODE.QUICK_MODE:
                return this.changeSpinMode( SPIN_MODE.TURBO_MODE );

            default:
                return this.changeSpinMode( SPIN_MODE.NORMAL_MODE );
        }
    }

    protected clickAutoButton () {
        if ( this.machine != null ) {
            if ( this.machine.state != MACHINE_STATE.IDLE ) return;
            if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;
        }

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let duration = 0.25;
        EffectUtils.open( this.controllerSetting.autoSpinUI, duration, 'backInOut' );
    }
    protected closeAutoSpinUI () {
        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let duration = 0.25;
        EffectUtils.close( this.controllerSetting.autoSpinUI, duration, 'backIn', false );
    }

    protected confirmAutoSpin () {
        if ( this.machine.state != MACHINE_STATE.IDLE ) return;
        if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        this.closeAutoSpinUI();

        if ( this.controllerSetting.spinTimesSB.Active === true ) {
            let data = this.controllerSetting.spinTimesDP.getPickData();
            if ( data.customData === '-1'){
                this.autoSpin.setSpinTimeUnlimited( true );
            } 
            else {
                let times = Number.parseInt( data.customData );
                this.autoSpin.setSpinTimeUnlimited( false );
                this.autoSpin.setSpinTimeValue( times );
            }
        }

        return this.autoSpin.checkActiveAutoSpin();
    }

    protected clickOptionButton () {
        if ( this.machine != null ) {
            if ( this.machine.state != MACHINE_STATE.IDLE ) return;
            if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;
        }

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let opUI = this.controllerSetting.optionUI;
        let btUI = this.controllerSetting.bottomUI;
        opUI.active = true;
        tween( btUI ).to( 0.2, { position: this.optionUITweenPos[ 1 ] }, { easing: "backIn" } ).start();
        tween( opUI ).delay( 0.2 ).to( 0.2, { position: this.optionUITweenPos[ 0 ] }, { easing: "backIn" } ).start();
    }

    public closeOptionUI () {
        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let opUI = this.controllerSetting.optionUI;
        let btUI = this.controllerSetting.bottomUI;
        tween( opUI ).to( 0.2, { position: this.optionUITweenPos[ 1 ] }, { easing: "backIn", onComplete: () => { opUI.active = false; } } ).start();
        tween( btUI ).delay( 0.2 ).to( 0.2, { position: this.optionUITweenPos[ 0 ] }, { easing: "backIn" } ).start();
    }

    /**
     * 音樂音效開關
     */
    public clickSoundPlayMode () {

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let mode = SoundManager.getMode();
        let nextMode = SoundManager.setMode( this.changeSoundPlayModeMap[ mode ] );
        if ( mode === nextMode ) return;

        this.soundPlayModeSpriteFrame[ mode ].active = false;
        this.soundPlayModeSpriteFrame[ nextMode ].active = true;
    }

    /**
     *  全螢幕切換顯示
     */
    public clickFullScreen () {
        if ( Game.Instance == null ) return;

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        if ( Game.Instance.isFullScreen ) {
            Game.Instance.fullscreen( false );
            this.fullScreenSpriteFrame[ 0 ].active = false;
            this.fullScreenSpriteFrame[ 1 ].active = true;
        } else {
            Game.Instance.fullscreen( true );
            this.fullScreenSpriteFrame[ 0 ].active = true;
            this.fullScreenSpriteFrame[ 1 ].active = false;
        }
    }

    /**
     * 點擊投注記錄
     * todo 另開新分頁
     */
    public clickHtml () {

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        //let url = gameInformation.fullBetrecordurl;
        let url: string = UrlParameters.betRecordUrl + '?token=' + UrlParameters.token + '&lang=' + UrlParameters.language + '&serverurl=' + UrlParameters.serverUrl;
        window.open( url );
    }

    private _lastBalance: number = 0;
    public get balanceLabel () { return this.controllerSetting.balanceLabel; }
    public showBalance ( value: number ) {
        let target = { value: this._lastBalance };
        tween( target ).to( 1, { value: value }, {
            easing: "quintIn", onUpdate: () => {
                let comma = Utils.numberComma( Math.floor( target.value ) );
                this.balanceLabel.string = this._currencySymbol + comma;
            }
        } ).start();
        this._lastBalance = value;
    }

    public setBalance ( value: number ) {
        let comma = Utils.numberComma( Math.floor( value ) );
        this.balanceLabel.string = this._currencySymbol + comma;
        this._lastBalance = value;
    }

    /** 取得賠付表計算資料 */
    public getPaytableSymbol ( symbolID ): number[] {
        let result = this.machine.getPaytableSymbol( symbolID );
        if ( result != null ) return result;


    }

    public _totalBet: number;
    public get totalBet (): number { return this._totalBet; }

    public get totalBetLabel () { return this.controllerSetting.totalBetLabel; }

    public get coin_value () {
        let coinValueArray = gameInformation.coinValueArray;
        let idx = this._betIdx;
        return coinValueArray[ idx ];
    }

    public totalBetValue ( idx: number ) {
        let coinValueArray = gameInformation.coinValueArray;
        let conValue = coinValueArray[ idx ];
        let lineBet = gameInformation.lineBet;
        let lineTotal = gameInformation.lineTotal;
        let totalBet = conValue * lineBet * lineTotal;

        return totalBet;
    }

    public showTotalBet () {
        let idx = this._betIdx;
        let totalBet = this.totalBetValue( idx );

        this._totalBet = totalBet;
        let comma = Utils.numberComma( totalBet );

        this.totalBetLabel.string = this._currencySymbol + comma;
    }
    /**
     * 變更下注
     * @param evt 按鍵來源
     * @param value +1,-1
     */
    public changeBet ( evt: Event, value: number ) {
        if ( this.machine == null ) return;
        if ( this.machine.state != MACHINE_STATE.IDLE ) return;
        if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;

        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        let idx = this._betIdx;
        let coinValueArray = gameInformation.coinValueArray;
        if ( value > 0 ) {
            idx++;
            if ( idx >= coinValueArray.length ) idx = 0;
        } else {
            idx--;
            if ( idx < 0 ) idx = coinValueArray.length - 1;
        }
        this._betIdx = idx;
        gameInformation.coinValue = this.coin_value;
        this.showTotalBet();
    }

    public get totalWinLabel () { return this.controllerSetting.totalWinLabel; }
    public setTotelWin ( value: number ) {
        // if ( value === 0 ) return this.totalWinLabel.string = '';
        let comma = Utils.numberComma( value );
        let message = this._currencySymbol + comma;
        let lan = gameInformation.lang;
        if ( lan == null ) lan = 'en';
        let marquee: string = this.getTotalWinMarquee( lan, this._currencySymbol );
        this.totalWinLabel.string = message;
        //this.controllerSetting.landscapeTotalWinLabel.string = `TOTAL WIN ${message}`;
        this.controllerSetting.landscapeTotalWinLabel.string = `${ marquee }${ comma }`;
    }

    public showTotalWin ( value: number ) {
        if ( value === 0 ) return this.setTotelWin( 0 );

        let data = { number: 0 };
        let self = this;
        let currency = this._currencySymbol;
        let lan = gameInformation.lang;
        if ( lan == null ) lan = 'en';
        let marquee: string = this.getTotalWinMarquee( lan, currency );
        tween( data ).delay( 0.5 ).to( 1, { number: value }, {
            onUpdate ( target ) {
                let message = Utils.numberComma( target[ 'number' ] );
                self.totalWinLabel.string = `${ currency } ${ message }`;
                //self.controllerSetting.landscapeTotalWinLabel.string = `TOTAL WIN ${currency} ${message}`;
                self.controllerSetting.landscapeTotalWinLabel.string = `${ marquee }${ message }`;
            }
        } ).start();
    }
    /**
     * 3900格式的 totalWin Marquee(跑馬燈式訊息)
     * @param currency 
     * @param language 
     * @param win 
     * Todo: 多國語系文字 加入 language.json
     */
    public getTotalWinMarquee ( language: string, currency: string ): string {
        let MSG_TOTALWIN = {
            "zh-cn": "总赢得",
            "en": "TOTAL   WIN",
            "id": "Total   Kemenangan",
            "ko": "총 상금",
            "vi": "Tổng thắng",
            "th": "ชนะทั้งหมด",
            "ms": "Jumlah kemenangan",
            "ph": "Kabuuang Panalo"
        }
        let message: string = MSG_TOTALWIN[ language ] + '      ' + currency + ' ';
        return message;
    }

    /** 每次執行Spin, 處理Spin按鈕狀態 */
    public checkSpinState ( active: SPIN_ACTION = SPIN_ACTION.SPIN ) {
        if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return;
        return this.spinButtonController( active );
    }

    //#region AutoSpin Button

    public activeSpinTime ( active: boolean ) { this.autoSpin.setSpinTimeActive( active ); }
    public activeUntilFeature ( active: boolean ) { this.autoSpin.setUntilFeature( active ); }
    public activeSingleSpinWins ( active: boolean ) { this.autoSpin.setSingleSpinWinsActive( active ); }
    public activeBalanceMoreActive ( active: boolean ) { this.autoSpin.setBalanceMoreActive( active ); }
    public activeBalanceLessActive ( active: boolean ) { this.autoSpin.setBalanceLessActive( active ); }
    public spinTimeDropdown ( node: Node, name: string, idx: number, data: string, arg: string ) {
        if ( data === '-1' ) {
            this.autoSpin.setSpinTimeUnlimited( true );
            return;
        }

        let times = parseInt( name );
        this.autoSpin.setSpinTimeUnlimited( false );
        this.autoSpin.setSpinTimeValue( times );
        return;
    }

    public singleSpinWinsDropdown ( node: Node, name: string, idx: number, data: string, arg: string ) {
        let value = parseInt( data );
        this.autoSpin.setSingleSpinWinsValue( value );
    }

    public singleBalanceMoreDropdown ( node: Node, name: string, idx: number, data: string, arg: string ) {
        let value = parseInt( data );
        this.autoSpin.setBalanceMoreValue( value );
    }

    public singleBalanceLessDropdown ( node: Node, name: string, idx: number, data: string, arg: string ) {
        let value = parseInt( data );
        this.autoSpin.setBalanceLessValue( value );
    }

    //#endregion

    /**
     * 點擊橫版的 Option 按鈕
     * @todo 做出旋轉效果
     * @todo 打開/關閉 Option 按鈕群
     */
    public clickLandscapeOption () {
        SoundManager.playSoundData( this.controllerSetting.pressBtnAudio );
        return this.activeLandscapeOption( !this.controllerSetting.landscapeOptionContainer.active );
    }
    // 橫版 option 的 tween 動畫
    private tweenLandscapeOption;

    public activeLandscapeOption ( active: boolean ) {
        if ( this.tweenLandscapeOption != null ) {
            this.tweenLandscapeOption.stop();
        }

        let btn = this.controllerSetting.landscapeOptionButton;
        let q: Quat = new Quat( 0, 0, 0, 0 );

        if ( active ) {
            Quat.fromAngleZ( q, -45 );
        } else {
            Quat.fromAngleZ( q, 0 );
        }
        // btn.setRotation(q);
        this.tweenLandscapeOption = tween( btn ).to( 0.3, { rotation: q }, { easing: 'backInOut' } ).start();
        this.controllerSetting.landscapeOptionContainer.active = active;
    }


    //#region Error UI

    private clickErrorHandle: EventHandler = null;

    /**
     * 打開錯誤訊息介面
     * @param errorMessage 訊息內容
     * @param clickOkHandler 點擊 ok 事件, 預設為重整網頁
     * 廢棄使用 2024/01/04
     */

    /*
    public openErrorUI(errorMessage: string, clickOkHandler: EventHandler = null) {
        this.controllerSetting.errorUILabel.string = errorMessage;
        this.controllerSetting.errorUINode.active = true;
        this.clickErrorHandle = clickOkHandler;
    }*/

    /**
     * 點擊錯誤訊息的 ok 按鈕
     */
    public clickErrorUIButton () {
        if ( this.clickErrorHandle != null ) return this.clickErrorHandle.emit( [] );
        window.location.reload();
    }

    //#endregion
}

/**
 * 自動Spin相關功能
 */

export class AutoSpin {
    public active = false;

    public controller: Controller;

    private Data = {
        SpinTimes: {
            unlimited: false,
            active: false,
            value: 0,
        },

        UntilFeature: false,

        SingleSpinWins: {
            active: false,
            value: 0,
        },

        BalanceMore: {
            active: false,
            value: 0,
        },

        BalanceLess: {
            active: false,
            value: 0,
        }
    };

    public setController ( controller: Controller ) { this.controller = controller; }
    public setSpinTimeActive ( active: boolean ) { this.Data.SpinTimes.active = active; }
    public setSpinTimeValue ( times: number ) { this.Data.SpinTimes.value = times; }
    public setSpinTimeUnlimited ( active: boolean ) { this.Data.SpinTimes.unlimited = active; }
    public setUntilFeature ( active: boolean ) { this.Data.UntilFeature = active; }
    public setSingleSpinWinsActive ( active: boolean ) { this.Data.SingleSpinWins.active = active; }
    public setSingleSpinWinsValue ( value: number ) { this.Data.SingleSpinWins.value = value; }
    public setBalanceMoreActive ( active: boolean ) { this.Data.BalanceMore.active = active; }
    public setBalanceMoreValue ( value: number ) { this.Data.BalanceMore.value = value; }
    public setBalanceLessActive ( active: boolean ) { this.Data.BalanceLess.active = active; }
    public setBalanceLessValue ( value: number ) { this.Data.BalanceLess.value = value; }

    /**
     * 回傳要不要因為 SpinTime 為 0, 停止 AutoSpin 
     * @todo 判斷依據為，本來有 AutoSpin 因為到達條件而停止 AutoSpin
     * @returns 要不要停止 Auto Spin, ture:停止
     */
    public checkStopSpinTime (): boolean {
        if ( this.Data.SpinTimes.active === false ) return false;
        if ( this.Data.SpinTimes.value > 0 ) return false;
        return true;
    }

    public getSpinTimes () {
        if ( this.Data.SpinTimes.active === false ) return '';
        if ( this.Data.SpinTimes.unlimited === true ) return '∞';
        return `${ this.Data.SpinTimes.value - 1 } `;
    }

    public checkUntilFeature (): boolean {
        return this.Data.UntilFeature;
    }

    public checkSingleSpinWins ( totalWin: number ): boolean {
        if ( this.Data.SingleSpinWins.active === false ) return false;
        if ( this.Data.SingleSpinWins.value > totalWin ) return false;
        return true;
    }

    public checkBalanceMore ( balance: number ): boolean {
        if ( this.Data.BalanceMore.active === false ) return false;
        if ( this.Data.BalanceMore.value > balance ) return false;
        return true;
    }

    public checkBalanceLess ( balance: number ): boolean {
        if ( this.Data.BalanceLess.active === false ) return false;
        if ( this.Data.BalanceLess.value <= balance ) return false;

        return true;
    }

    public reduceSpinTime () {
        // if ( this.checkStopSpinTime() == false ) return false;
        if ( this.Data.SpinTimes.active === false ) return false;
        if ( this.Data.SpinTimes.unlimited === true ) return true;
        this.Data.SpinTimes.value--;
        return true;
    }

    /**
     * 回傳要不要停止 AutoSpin 
     * @todo 判斷依據為，本來有 AutoSpin 因為到達條件而停止 AutoSpin
     * @from Machine.spinComplete()
     * @returns 要不要停止 Auto Spin, ture:停止
     */
    public checkStopAutoSpin ( totalWin: number, balance: number ): boolean {
        /// 本來就沒打開
        if ( this.getActive === false ) return false;
        this.reduceSpinTime();

        let checkList = [
            this.checkStopSpinTime(),
            this.checkSingleSpinWins( totalWin ),
            this.checkBalanceMore( balance ),
            this.checkBalanceLess( balance )
        ];

        /// 有沒有達到條件
        if ( checkList.includes( true ) == false ) return false;

        /// 達到條件，要關掉 AutoSpin
        this.setActive = false;

        return true;
    }

    public checkActiveAutoSpin () {
        let autoSpinList = [
            this.Data.SpinTimes.active,
            this.Data.UntilFeature,
            this.Data.SingleSpinWins.active,
            this.Data.BalanceMore.active,
            this.Data.BalanceLess.active
        ];

        let active = autoSpinList.includes( true );
        this.active = active;
        this.controller.getMachine.eventActiveAutoSpin();
        return active;
    }

    public get getActive () { return this.active; }
    public set setActive ( active: boolean ) {
        this.active = active;
        if ( active === false ) this.controller.controllerSetting.autoSpinTimesLabel.string = '';
    }
}