import { _decorator, Sprite, Component, Node, Vec3, tween, Label, Button, EventTarget, JsonAsset, ccenum, UIOpacity, CCInteger, CCFloat, Color } from 'cc';
import { Reel } from '../Reel';
import { Utils, DATA_TYPE } from '../../../utils/Utils';
import { Machine } from '../Machine';
import { BigWin } from '../BigWin';
import { Controller } from '../controller_folder/Controller';
import { gameInformation } from '../../GameInformation';
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

    public get controller() : Controller { return this.machine.controller; }

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
     ** 從 Server 取得的結果
     * @override 可以覆寫
     * @param result 
     */
    public spinResult ( result ) { return this.setGameResult(result['main_game']); }
    
    /**
     ** 設定 gameResult
     * @param gameResult 
     * @override 可以覆寫
     * @returns 
     */
    public setGameResult(gameResult) {
        this.properties['gameResult'] = gameResult;
        return this.setReelResult();
    }

    /**
     * 整理盤面結果, 通知 Reel 照結果停止
     * @override 可以覆寫
     * @param reelResult 
     */
    public setReelResult( ) {
        let reelResult = this.gameResult['result_reels'];
        this.reel.setResult(reelResult);
    }

    /**
     * 從 Machine 通知開始 SPIN
     * @todo 等待 reel SPIN 結束
     * @todo 處理報獎流程
     * @override 可覆寫
     */
    public async spin(eventTarget:EventTarget=null) {
        this.breakPerformSingleLineLoop();          // 取消報獎流程
        this.machine.state = Machine.SPIN_STATE.SPINNING;
        await this.reel.spin();                     // 等待 SPIN 結束
        this.machine.state = Machine.SPIN_STATE.STOPPING;
        await this.processWinningScore();           // 執行報獎流程
        this.machine.state = Machine.SPIN_STATE.IDLE;
        eventTarget?.emit('done');
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
        if ( this.machine.featureGame === false) this.controller.setTotalWin(0);
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

    /** 計算 NearMiss 位置 */
    public getNearMissIndex(reel_result) : number {
        if ( this.machine.reel.nearMissSymbolData == null ) return -1;
        if ( this.machine.reel.nearMissSymbolData.length === 0 ) return -1;
        const nearMissSymbols = this.machine.reel.nearMissSymbolData;

        let nearMissIndex = 99;
        
        for(let k=0;k<nearMissSymbols.length;k++) {
            let reelCount = this.mergeReckonSymbolReelCount(nearMissSymbols[k].symbol, reel_result);
            let count = nearMissSymbols[k].count;
            let amount = 0;

            for(let i=0;i<reelCount.length;i++) {
                if ( nearMissIndex <= i ) break;
                amount += reelCount[i];
                
                if ( amount < count ) continue;
                nearMissIndex = i;
                break;
            }
        }
        
        return nearMissIndex;
    }

    /** 合併 Symbol 在每個 Reel 出現的個數 
     * @param sym { number[] } Symbol ID
     * @param reel_result { number[][] } Reel 結果
     * @returns { number[] } 每個 Reel 出現的個數 ex: [0,1,2,0,1]
     */
    private mergeReckonSymbolReelCount(sym: number[], reel_result: number[][]): number[] {
        let count = [];
        for(let i=0;i<sym.length;i++) {
            let c = this.reckonSymbolReelCount(sym[i], reel_result);
            for(let j=0;j<c.length;j++) {
                if ( count[j] == null ) count[j] = 0;
                count[j] += c[j];
            }
        }
        return count;
    }

    /** 計算 Symbol 在每個 Reel 出現的個數 
     * @param sym { number } Symbol ID
     * @param reel_result { number[][] } Reel 結果
     * @returns { number[] } 每個 Reel 出現的個數 ex: [0,1,2,0,1]
     */ 
    public reckonSymbolReelCount(sym: number, reel_result: number[][]): number[] { return reel_result.map(reel => reel.reduce((count, symbol) => count + (symbol === sym ? 1 : 0), 0) ); }
}

/**
 * 購買FeatureGame介面操作
 */
@ccclass( 'BuyFeatureGameUI' )
export class BuyFeatureGameUI {
    public get machine () : Machine { return Machine.Instance }
    public get reel (): Reel { return this.machine.reel; }
    public get paytable () : Paytable { return this.machine.paytable; }
    public get controller() : Controller { return this.machine.controller; }
    public get betIdx() :number { return this.properties.totalBet.idx; }
    public set betIdx(value) { 
        this.properties.totalBet.idx = value; 
        console.log('this.properties.totalBet.idx', value, this.properties.totalBet.idx);
    }

    public set totalBet(value) { 
        this.properties.totalBet.value = value;
        this.properties['BuyFeatureGameUI']['valueLabel'].component.string = Utils.numberComma(value); 
    }

    public properties = {
        'BuyFeatureGameUI' : {
            'ui' : null,
            'buyButton' : null,
            'closeButton' : null,
            'valueLabel' : null,
            'addBetButton' : null,
            'subBetButton' : null,
         },
         'totalBet': {
            'idx' : 0,
            'value' : 0,
         },
    };

    public get node() { return this.properties.BuyFeatureGameUI['ui'].node; }

    public init(inspector:any) {
        const onLoadData = {
            'BuyFeatureGameUI' : {
                'ui'            : { [DATA_TYPE.TYPE] : Node,   [DATA_TYPE.SCENE_PATH] : inspector.buyFeatureGameUI.getPathInHierarchy()},
                'valueLabel'    : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.SCENE_PATH] : inspector.valueLabelNode.getPathInHierarchy()  },
                'buyButton'     : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.buyButtonNode.getPathInHierarchy(),    [DATA_TYPE.CLICK_EVENT]: this.clickBuyFeatureGameConfirm  },
                'closeButton'   : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.closeButtonNode.getPathInHierarchy(),  [DATA_TYPE.CLICK_EVENT]: this.onClickClose, },
                'addBetButton'  : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.addBetButtonNode.getPathInHierarchy(), [DATA_TYPE.CLICK_EVENT]: this.addBet },
                'subBetButton'  : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.subBetButtonNode.getPathInHierarchy(), [DATA_TYPE.CLICK_EVENT]: this.subBet},
                'openButton'    : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.SCENE_PATH] : inspector.mainGameBuyFeatureGameButtonNode.getPathInHierarchy(), [DATA_TYPE.CLICK_EVENT]: this.onClickOpenUI },
            }
        };

        Utils.initData(onLoadData, this);
        this.node.active = false;
        this.node.setPosition(0, 0, 0);
    }

    public onClickClose() { 
        this.controller.maskActive(false);
        Utils.commonActiveUITween(this.node, false); 
    }

    public onClickOpenUI() { 
        if ( this.machine.isBusy ) return;

        this.betIdx = this.controller.betIdx;
        this.refreshTotalBet();
        this.controller.maskActive(true);
        Utils.commonActiveUITween(this.node, true); 
    }

    public refreshTotalBet() {
        this.totalBet = this.betValue;
    }

    public addBet() { return this.setBet(1); }
    public subBet() { return this.setBet(-1); }

    private setBet(add:number) {
        let idx = this.betIdx;
        const coinValueArray = gameInformation.coinValueArray;
        const max = coinValueArray.length;
        idx += add;
        if ( idx < 0 ) idx = max - 1;
        if ( idx >= max ) idx = 0;
        this.betIdx = idx;
        this.refreshTotalBet();
    }

    private get betValue() { 
        const [ coinValue, lineBet, lineTotal, multiplier ] = [
            gameInformation.coinValueArray[this.betIdx],
            gameInformation.lineBet,
            gameInformation.lineTotal,
            gameInformation.buyInformation.multiplier,
        ];

        return coinValue * 1000 * lineBet * lineTotal * multiplier / 1000;
    }

    public clickBuyFeatureGameConfirm() {
        if ( this.machine.isBusy ) return;
        if ( this.machine.buyFeatureGame(this.betIdx) === false ) return;
        console.log('clickBuyFeatureGame');
        this.onClickClose();
    }
}