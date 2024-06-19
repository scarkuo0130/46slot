import { _decorator, Sprite, Component, Node, Vec3, tween, Label, EventHandler, EventTarget, JsonAsset, ccenum, UIOpacity, CCInteger, CCFloat, Color } from 'cc';
import { Reel } from '../Reel';
import { Utils, DATE_TYPE } from '../../../utils/Utils';
import { Machine2_0 } from '../Machine2.0';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

export enum PAYTABLE_TYPE {
    PAYLINE = 1,
    PAYWAY = 2,
    OTHER = 3,
}

@ccclass( 'Paytable' )
@disallowMultiple( true )
@menu( 'SlotMachine/PayTable/PayTable' )
@menu( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.2vlv1h3mtlze' )
export class Paytable extends Component {

    @property( { type: Node, displayName: '遮罩物件', tooltip: 'reelMask', group: { name: '遮罩', id: '0' } } )
    public reelMask: Node = null;

    private initData = {
        'ui' : {
            // 顯示得獎分數
            'labelWinScore'       : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'labelWinScore' },
            // 單項得獎分數
            'labelSingleWinScore' : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'labelSingleWinScore' },
        },
    };

    private properties = {
        'machine' : null,
        'gameResult' : null, // 一個盤面的結果
        'maskEvent' : null,
        'ui' : {},
    };

    public get machine () : Machine2_0 { return this.properties['machine']; }

    public get reel (): Reel { return this.machine.reel; }

    public get gameResult () { return this.properties['gameResult']; }

    public get mask() { return this.reelMask; }

    public get totalWinLabel() : Label { return this.properties.ui?.labelWinScore?.component ; }

    onLoad () {
        this.init();
    }

    protected start(): void {
        this.reelMaskActive(false);
        this.totalWinLabel.string = '';
    }

    private init() {
        this.properties['machine'] = Machine2_0.Instance;
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
        this.breakPerformSingleLineLoop(); // 取消報獎流程
        this.machine.state = Machine2_0.SPIN_STATE.SPINNING;
        await this.reel.spin(); // 等待 SPIN 結束
        this.machine.state = Machine2_0.SPIN_STATE.STOPPING;
        await this.processWinningScore(); // 執行報獎流程
        this.machine.state = Machine2_0.SPIN_STATE.IDLE;
        this.performSingleLineLoop(); // 執行單項報獎流程
    }

    /**
     * 進入報獎流程
     * @override 可覆寫
     * @todo 如果有中獎的話, 進入報獎流程
     * @todo 報獎完畢後，如果分數高於 BigWin 分數，進入 BigWin 流程
     * @todo 如果玩家沒有中斷報獎流程，則進入輪播報獎流程
     */
    public async processWinningScore() { return await this.performAllPayline(); }

    /**
     * 播放全部獎項
     */
    public async performAllPayline() {
        // 打開遮罩
        await this.reelMaskActive(true);

        // 播放全部獎項
        let max_wait_sec = 0;
        for(let i = 0; i < this.gameResult['pay_line'].length; i++) {
            let payline = this.gameResult['pay_line'][i];
            let sec = await this.performSingleLine(payline, false);
            if ( sec > max_wait_sec ) max_wait_sec = sec;
        }

        // 等待最大時間
        await Utils.delay(max_wait_sec * 1000 + 100);

        // 關閉遮罩
        await this.reelMaskActive(false);
    };

    /**
     * 播放單項獎項
     * @param payline { Json } 獎項資料
     * @param isWait { boolean } 是否等待
     * @returns { number } 等待秒數
     */
    public async performSingleLine(payline:any, isWait:boolean=true) : Promise<number>  {
        const { amount, pay_credit, pay_line, symbol_id } = payline;
        let winningSymbols = this.reel.getSymbolById(symbol_id);    // 取得 Symbol 資料
        let spineSec = winningSymbols[0].getAnimationDuration();    // 取得獎項動畫時間
        spineSec += 1;
        console.log('spineSec', spineSec);

        // 播放獎項動畫
        winningSymbols.forEach( symbol => symbol.win() );

        return spineSec;
    }


    /**
     * 遮罩開關
     * @param active 
     * @returns 
     */
    protected async reelMaskActive ( active: boolean ) {
        if ( this.mask == null ) return;
        this.maskFadeIn( active );
    }

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
    }

    @property( { type: Label, displayName: 'WinNumberAllLine', tooltip: '全部中獎的分數Label', group: { name: 'settings', id: '0' } } )
    public winNumberAllLine: Label;

    @property( { type: Label, displayName: 'WinNumberSingleLine', tooltip: '單線中獎的分數Label', group: { name: 'settings', id: '0' } } )
    public winNumberSingleLine: Label;

    @property( { displayName: 'WinNumberSinglePos', tooltip: '單線中獎的分數Label位移', group: { name: 'settings', id: '0' } } )
    public winNumberSinglePos: Vec3 = new Vec3();

    @property( { type: JsonAsset, displayName: 'PaytableSymbolData', tooltip: 'Symbol賠付表', group: { name: 'settings', id: '0' } } )
    public paytableSymbolJson: JsonAsset;

    protected tempPayRuleData;
    protected tempTotalWin;
    protected tempLoopIdx = 0;
    protected tempCancelPerform: boolean = false;


    protected singleLineActive ( active: boolean, score: string = '' ) {
        if ( this.winNumberSingleLine == null ) return;
        this.winNumberSingleLine.node.active = active;
        this.winNumberSingleLine.string = score;
    }

    protected setSingleLinePos ( wheelX: number, wheelY: number, score: number ) {
        let wheels = this.reel.getWheels();
        let wheel = wheels[ wheelX ];
        if ( wheel == null ) return;

        let symbol: Node = wheel.getSymbol( wheelY );
        if ( symbol == null ) return;

        let pos = symbol.worldPosition.clone();
        pos.add( this.winNumberSinglePos );
        this.winNumberSingleLine.node.worldPosition = pos;

        console.log( this.winNumberSingleLine.node.worldPosition );
        this.singleLineActive( true, Utils.numberComma( score ) );
    }


    public async setPerformAllLineValue ( value: number, startTween: number = 0, tweenSec: number = 0 ) {
        if ( value === null ) return this.winNumberAllLine.string = '';
        if ( value === 0 ) return this.winNumberAllLine.string = 'WIN 0';
        if ( tweenSec === 0 ) return this.winNumberAllLine.string = `WIN ${ Utils.numberComma( value ) }`;

        let tweenNumber = { value: startTween };
        let self = this;
        tween( tweenNumber ).to( tweenSec, { value: value }, {
            onUpdate: () => {
                let value = Math.floor( tweenNumber.value );
                self.winNumberAllLine.string = `WIN ${ Utils.numberComma( value ) }`;
            }
        } ).start();
        return await Utils.delay( tweenSec * 1000 );
    }

    /**
     * 取消播放獎項效果
     */
    public cancelPerform () {
        this.closePayline();
        this.tempCancelPerform = true;
        // this.node.active = false;
    }

    /**
     * 關閉顯示得分狀態
     */
    protected closePayline () {
        this.reelMaskActive( false );
        this.singleLineActive( false );
    }

    /** 全獎播放 **/

    public async performAllPayline_old ( payRuleData, totalWin: number, onCompleteCallBack: EventHandler ) {
        this.tempPayRuleData = payRuleData;
        this.tempTotalWin = totalWin;
        this.tempLoopIdx = -1;
        this.tempCancelPerform = false;
        this.node.active = true;

        await this.performAllLine( payRuleData, totalWin, true );
        this.singleLineActive( false );
        return onCompleteCallBack.emit( [ onCompleteCallBack.customEventData ] );
    }

    /**
     * 播放全部獎項，此功能撰寫在各繼承模組 ex payline, payway...
     * @param payRuleData 
     * @returns 
     */
    public async performAllLine ( payRuleData, totalWin: number, firstTime = false ) { return; }

    /** 單獎輪播 **/
    public async performSingleLineLoop () { return; }

    /**
     * 單獎輪播
     * @param lineData 
     * @param isAllLine 
     * @returns 
     */
    public async performSingleLine_old ( lineData, isAllLine: boolean = false ) { return; }
}

