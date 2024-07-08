import { _decorator, Sprite, Component, Node, Vec3, tween, Label, Button, EventTarget, JsonAsset, ccenum, UIOpacity, CCInteger, CCFloat, Color } from 'cc';
import { Reel } from '../Reel';
import { Utils, DATA_TYPE } from '../../../utils/Utils';
import { Machine } from '../Machine';
import { BigWin } from '../BigWin';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;


@ccclass( 'PaytableInspector' )
export class PaytableInspector {
    
    // regin BuyFeatureGame 設定 id:1
    @property( { type: Node, displayName: '主遊戲購買按鈕', tooltip: 'mainGameBuyFeatureGameButtonNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public mainGameBuyFeatureGameButtonNode: Node;

    @property( { type: Node, displayName: '購買FeatureGame介面', tooltip: 'buyFeatureGameUI', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public buyFeatureGameUI : Node;

    @property( { type: Node, displayName: '購買按鈕', tooltip: 'buyButtonNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public buyButtonNode : Node;

    @property( { type: Node, displayName: '關閉按鈕', tooltip: 'closeButtonNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public closeButtonNode : Node;

    @property( { type: Node, displayName: 'TotalBetLabel', tooltip: 'buyButtonLabelNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public valueLabelNode : Node;

    @property( { type: Node, displayName: '增加Bet按鈕', tooltip: 'addBetButtonNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public addBetButtonNode : Node;

    @property( { type: Node, displayName: '減少Bet按鈕', tooltip: 'subBetButtonNode', group: { name: 'BuyFeatureGameUI', id: '1' } } )
    public subBetButtonNode : Node;
    // endregion

}

@ccclass( 'Paytable' )
@disallowMultiple( true )
@menu( 'SlotMachine/PayTable/PayTable' )
@menu( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.2vlv1h3mtlze' )
export class Paytable extends Component {

    @property( { type: Node, displayName: '遮罩物件', tooltip: 'reelMask', group: { name: 'settings', id: '0' } } )
    public reelMask: Node = null;

    @property( { displayName: '單線中獎的分數Label位移', tooltip: 'winNumberSinglePos', group: { name: 'settings', id: '0' } } )
    public winNumberSinglePos: Vec3 = new Vec3();

    @property({ type:PaytableInspector, displayName: '機台設定', tooltip: 'Inspector', group: { name: 'settings', id: '0' }})
    public inspector: PaytableInspector = new PaytableInspector();

    private initData = {
        'ui' : {
            // 顯示得獎分數
            'labelWinScore'       : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'labelWinScore' },
            // 單項得獎分數
            'labelSingleWinScore' : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'labelSingleWinScore' },
        },
    };

    protected properties = {
        'machine' : null,
        'gameResult' : null, // 一個盤面的結果
        'maskEvent' : null,
        'ui' : {
            'labelWinScore':{},
            'labelSingleWinScore':{},
        },
    };

    public buyFeatureGame: BuyFeatureGameUI = new BuyFeatureGameUI();

    public get machine () : Machine { return this.properties['machine']; }

    public get reel (): Reel { return this.machine.reel; }

    public get gameResult () { return this.properties['gameResult']; }

    public get mask() { return this.reelMask; }

    public get totalWinLabel() : Label { return this.properties.ui?.labelWinScore?.component ; }

    public get singleWinLabel() : Label { return this.properties.ui?.labelSingleWinScore?.component ; }

    // 給予專案 onLoad 使用
    protected onload() { return; }

    // 給予專案 start 使用
    protected onstart() { return; }

    onLoad () {
        this.init();
        this.initBuyFeatureGameUI();
        this.onload();
    }

    protected start(): void {
        this.reelMaskActive(false);
        this.totalWinLabel.string = '';
        this.singleWinLabel.string = '';
        this.onstart();
    }

    protected initBuyFeatureGameUI() {
        if ( this.inspector.buyFeatureGameUI == null ) return console.warn('Paytable 未設定 BuyFeatureGameUI');
        if ( this.inspector.mainGameBuyFeatureGameButtonNode == null ) return console.warn('Paytable 未設定 mainGameBuyFeatureGameButtonNode');
        this.buyFeatureGame.init(this.inspector);
    }

    private init() {
        this.properties['machine'] = Machine.Instance;
        this.machine.paytable = this;
        Utils.initData(this.initData, this);
        this.properties['maskEvent'] = new EventTarget();
    }

    /**
     * 從 Server 取得的結果
     * @param result 
     */
    public async spinResult ( result ) {
        let gameResult = result['main_game'];
        this.properties['gameResult'] = gameResult; // 設定本盤面結果
        return this.setGameResult();
    }

    /**
     * 整理盤面結果, 通知 Reel 照結果停止
     * @override 可以覆寫
     * @param reelResult 
     */
    public setGameResult( ) {
        let reelResult = this.gameResult['game_result'];
        this.reel.setResult(reelResult);
    }

    /**
     * 從 Machine 通知開始 SPIN
     * @todo 等待 reel SPIN 結束
     * @todo 處理報獎流程
     * @override 可覆寫
     */
    public async spin() {
        this.breakPerformSingleLineLoop();          // 取消報獎流程
        this.machine.state = Machine.SPIN_STATE.SPINNING;
        await this.reel.spin();                     // 等待 SPIN 結束
        this.machine.state = Machine.SPIN_STATE.STOPPING;
        await this.processWinningScore();           // 執行報獎流程
        this.machine.state = Machine.SPIN_STATE.IDLE;
        this.performSingleLineLoop();               // 執行單項報獎流程
    }

    /**
     * 進入報獎流程
     * @override 可覆寫
     * @todo 如果有中獎的話, 進入報獎流程
     * @todo 報獎完畢後，如果分數高於 BigWin 分數，進入 BigWin 流程
     * @todo 如果玩家沒有中斷報獎流程，則進入輪播報獎流程
     */
    public async processWinningScore() { 
        return await this.performAllPayline(); 
    }

    /**
     * 播放 BigWin
     * @param score { number } 分數
     */
    public async processBigWin(score:number) {
        if ( this.machine.bigwin?.isBigWin(score) != BigWin.BIGWIN_TYPE.NONE ) {
            this.machine.bigwin.playBigWin(score);
            await this.machine.bigwin.waitingBigWin();
        }
    }

    /**
     * 播放全部獎項
     */
    public async performAllPayline() {}

    /**
     * 播放單項獎項
     * @param payline { Json } 獎項資料
     * @param isWait { boolean } 是否等待
     * @returns { number } 等待秒數
     */
    public async performSingleLine(payline:any, isWait:boolean=true) : Promise<number>  { return 0;}


    /**
     * 遮罩開關
     * @param active 
     * @returns 
     */
    protected async reelMaskActive ( active: boolean ) {this.maskFadeIn( active ); }

    /**
     * 遮罩淡入淡出
     * @param {boolean} fadeIn 淡入淡出 true: 淡入 false: 淡出
     */
    protected async maskFadeIn (fadeIn: boolean) {
        if (this.mask == null || this.mask.active === fadeIn) return;

        let maskEvent = this.properties['maskEvent'];
        if (maskEvent['running'] === true) return;

        maskEvent['running'] = true;
        maskEvent.removeAll('done');

        let alphaFrom       = fadeIn ? 0 : 200;
        let alphaTo         = fadeIn ? 200 : 0;
        let sprite          = this.mask.getComponent(Sprite);
        let onUpdate        = (x) => sprite.color = new Color(0, 0, 0, x.value);
        let onComplete      = ( ) => maskEvent.emit('done');
        sprite.node.active  = true;
        sprite.color        = new Color(0, 0, 0, alphaFrom);
        tween({ value: alphaFrom }).to(0.2, { value: alphaTo }, { onUpdate: onUpdate, onComplete: onComplete }).start();
        await Utils.delayEvent(maskEvent, 'done');

        sprite.node.active   = fadeIn;
        maskEvent['running'] = false;
    }

    public breakPerformSingleLineLoop() {
        this.reel.moveBackToWheel();        // 將所有 Symbol 移回輪中
        this.reelMaskActive(false);         // 關閉遮罩
        this.machine.controller.setTotalWin(0);
        this.displaySingleWinNumber(0);
    }

    /** 單獎輪播 **/
    public async performSingleLineLoop () { return; }

    public displaySingleWinNumber(pay_credit:number, pos: Vec3=Vec3.ZERO) {
        if ( pay_credit === 0 ) return this.singleWinLabel.string = '';
        let wPos = new Vec3(pos.x + this.winNumberSinglePos.x, pos.y + this.winNumberSinglePos.y, 0);
        this.singleWinLabel.string = Utils.numberComma(pay_credit);
        this.singleWinLabel.node.worldPosition = wPos;
    }

    /** 改變Bet事件呼叫  */
    public changeTotalBet( totalBet: number ) {}

    /** 進入遊戲事件 */
    public enterGame() {}

}

/**
 * 購買FeatureGame介面操作
 */
@ccclass( 'BuyFeatureGameUI' )
export class BuyFeatureGameUI {
    public get machine () : Machine { return Machine.Instance }

    public get reel (): Reel { return this.machine.reel; }

    public get paytable () : Paytable { return this.machine.paytable; }

    public properties = {
        'BuyFeatureGameUI' : {
            'ui' : null,
            'buyButton' : null,
            'closeButton' : null,
            'valueLabel' : null,
            'addBetButton' : null,
            'subBetButton' : null,
         },
    };

    public get node() { return this.properties.BuyFeatureGameUI['ui'].node; }

    public init(inspector:any) {
        const onLoadData = {
            'BuyFeatureGameUI' : {
                'ui'            : { [DATA_TYPE.TYPE] : Node,   [DATA_TYPE.SCENE_PATH] : inspector.buyFeatureGameUI.getPathInHierarchy()},
                'valueLabel'    : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.SCENE_PATH] : inspector.valueLabelNode.getPathInHierarchy()  },
                'buyButton'     : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.buyButtonNode.getPathInHierarchy()   },
                'closeButton'   : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.closeButtonNode.getPathInHierarchy(), [DATA_TYPE.CLICK_EVENT]: this.onClickClose, },
                'addBetButton'  : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.addBetButtonNode.getPathInHierarchy()},
                'subBetButton'  : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.subBetButtonNode.getPathInHierarchy()},
                'openButton'    : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.mainGameBuyFeatureGameButtonNode.getPathInHierarchy(), [DATA_TYPE.CLICK_EVENT]: this.onClickOpenUI },
            }
        };

        Utils.initData(onLoadData, this);
        this.node.active = false;
        this.node.setPosition(0, 0, 0);
    }

    public onClickClose() { 
        this.machine.controller.maskActive(false);
        Utils.commonActiveUITween(this.node, false); 
    }

    public onClickOpenUI() { 
        this.machine.controller.maskActive(true);
        Utils.commonActiveUITween(this.node, true); 
    }

}