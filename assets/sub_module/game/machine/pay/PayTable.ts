import { _decorator, Sprite, Component, Node, Vec3, tween, Label, EventHandler, EventTarget, JsonAsset, ccenum, UIOpacity, CCInteger, CCFloat } from 'cc';
import { Machine } from '../Machine';
import { Reel } from '../Reel';
import { CurveRangeProperty, Utils } from '../../../utils/Utils';
import { gameInformation } from '../../GameInformation';
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

    // @property({type:Node, displayName:'PaylineSymbolContainer', tooltip:'線前Container', group:{name:'settings', id:'0'}})
    //public paylineSymbolContainer;

    @property( { type: Label, displayName: 'WinNumberAllLine', tooltip: '全部中獎的分數Label', group: { name: 'settings', id: '0' } } )
    public winNumberAllLine: Label;

    @property( { type: Label, displayName: 'WinNumberSingleLine', tooltip: '單線中獎的分數Label', group: { name: 'settings', id: '0' } } )
    public winNumberSingleLine: Label;

    @property( { displayName: 'WinNumberSinglePos', tooltip: '單線中獎的分數Label位移', group: { name: 'settings', id: '0' } } )
    public winNumberSinglePos: Vec3 = new Vec3();

    @property( { type: JsonAsset, displayName: 'PaytableSymbolData', tooltip: 'Symbol賠付表', group: { name: 'settings', id: '0' } } )
    public paytableSymbolJson: JsonAsset;

    @property( { type: Node, displayName: 'ReelMask', tooltip: '遮罩物件', group: { name: '遮罩', id: '0' } } )
    public reelMask: Node = null;

    @property({type:CCFloat, displayName: '遮罩淡入秒數', tooltip: '遮罩淡入秒數', group:{name:'遮罩', id:'0'}})
    public reelMaskFadeInSec: number = 0.5;

    @property({type: CurveRangeProperty, displayName: '淡入動態曲線', tooltip: '動態曲線', group:{name:'遮罩', id:'0'}})
    public reelMaskFadeInCurve: CurveRangeProperty = new CurveRangeProperty();

    @property({type:CCFloat, displayName: '遮罩淡出秒數', tooltip: '遮罩淡出秒數', group:{name:'遮罩', id:'0'}})
    public reelMaskFadeOutSec: number = 0.5;

    @property({type: CurveRangeProperty, displayName: '淡出動態曲線', tooltip: '動態曲線', group:{name:'遮罩', id:'0'}})
    public reelMaskFadeOutCurve: CurveRangeProperty = new CurveRangeProperty();

    public machine: Machine;
    public get reel (): Reel { return this.machine.reel; }
    public setMachine ( machine ) { this.machine = machine; }

    protected paytableType: PAYTABLE_TYPE = PAYTABLE_TYPE.PAYLINE;
    protected funcCode = {};
    public showWinSymbol = [];
    protected tempPayRuleData;
    protected tempTotalWin;
    protected tempLoopIdx = 0;
    private paytableSymbolData;
    protected tempCancelPerform: boolean = false;

    protected notifyFail ( message: string ) {
        console.error( `Paytable ${ this.node[ ' INFO ' ] } ${ message }`, this );
        return false;
    }

    protected maskActive : boolean = false;
    /**
     * 遮罩淡入淡出
     * @param {boolean} fadeIn 淡入淡出 
     * @returns 
     */
    protected async maskFadeIn ( fadeIn:boolean ) {
        if ( this.reelMask == null ) return;
        if ( this.maskActive === fadeIn ) return;

        let opacity  = this.reelMask.getComponent(UIOpacity);       // 取得遮罩物件
        let endEvent = new EventTarget();                        // 建立事件
        let complete = () => { endEvent.emit('done'); };         // 完成事件

        // 淡入淡出 function
        let fade = (startOpacity: number, endOpacity: number, duration: number, easing: any) => {
            if (duration === 0) return complete();

            opacity.opacity = startOpacity;
            tween(opacity).to(duration, { opacity: endOpacity }, {easing, onComplete: complete}).start();
        };

        let easingFadeIn  = CurveRangeProperty.getEasing(this.reelMaskFadeInCurve);   // 取得淡入動態曲線
        let easingFadeOut = CurveRangeProperty.getEasing(this.reelMaskFadeOutCurve);  // 取得淡出動態曲線

        if (fadeIn === false) { // 執行淡出
            fade(180, 0, this.reelMaskFadeOutSec, easingFadeOut);
        } else {
            fade(0, 180, this.reelMaskFadeInSec, easingFadeIn);
        }

        this.maskActive = fadeIn; // 設定遮罩狀態

        // 等待淡入淡出完成
        return await Utils.delayEvent(endEvent, 'done');
    }
    protected checkInscept (): boolean {
        if ( this.winNumberAllLine == null ) return this.notifyFail( '未設定 winNumberAllLine' );

        return true;
    }

    /**
     * 遮罩開關
     * @param active 
     * @returns 
     */
    protected reelMaskActive ( active: boolean ) {
        if ( this.reelMask == null ) return;
        this.reelMask.active = true;
        this.maskFadeIn( active );
    }

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

    protected initInscept () {
        this.winNumberAllLine.string = '';
        this.setPerformAllLineValue( null );
        this.tempCancelPerform = false;
        this.reelMaskActive( false );

        if ( this.paytableSymbolJson != null ) {
            this.paytableSymbolData = this.paytableSymbolJson.json;
        }
    }

    onLoad () {
        if ( this.checkInscept() ) this.initInscept();
        if ( this.winNumberAllLine != null ) this.winNumberAllLine.string = '';
        if ( this.winNumberSingleLine != null ) this.winNumberSingleLine.string = '';
    }

    /**
     * 取得 Symbol獎項資料
     */
    public get getPaytableSymbolData () { return this.paytableSymbolData; }

    /**
     * 查詢 symbol 的 Paytable 賠率資料
     * @param symbolID 
     * @returns 
     */
    public getPaytableSymbolValue ( symbolID: number ): number[] {
        if ( this.paytableSymbolData == null ) return [ 0, 0, 0, 0, 0 ];
       
        let symbolData = this.paytableSymbolData[ symbolID ];
        let result: number[] = [];
        if ( symbolData == null ) return null;
        switch ( this.paytableType ) {

            case PAYTABLE_TYPE.PAYWAY:
                let totalBet = this.machine.controller.totalBet;
                for ( let i = 0; i < symbolData.length; i++ ) {
                    let value = totalBet * symbolData[ i ];
                    result.push( value );
                }
                return result;

            case PAYTABLE_TYPE.PAYLINE:
                let conValue = gameInformation._coinValue;
                let lineBet = gameInformation.lineBet;
                if (lineBet <= 0 ) lineBet = 1 ;
                if (conValue <= 0 ) conValue = 1 ;

                for ( let i = 0; i < symbolData.length; i++ ) {
                    let value = conValue * lineBet * symbolData[ i ];
                    result.push( value );
                }
                return result;

            default: // 這段有需求請寫在 machine 裏面
                return null;
        }

        return null;
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
    public async performAllPayline ( payRuleData, totalWin: number, onCompleteCallBack: EventHandler ) {
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
    public async performSingleLineLoop () {
        // let code = crypto.randomUUID();
        // this.funcCode['performSingleLineLoop'] = code;

        if ( this.tempCancelPerform === true ) {
            return this.closePayline();
        }

        let pay_line = this.tempPayRuleData[ 'pay_line' ];
        this.tempLoopIdx++;
        // console.log(this.tempLoopIdx);
        if ( this.tempLoopIdx === pay_line.length ) {
            this.tempLoopIdx = -1;
            await this.performAllLine( this.tempPayRuleData, this.tempTotalWin );
            // this.winNumberAllLine.string = '';
        } else {
            this.tempLoopIdx = this.tempLoopIdx % pay_line.length;
            await this.performSingleLine( pay_line[ this.tempLoopIdx ], false );
        }

        // this.reelMaskActive(false);
        this.closePayline();
        if ( this.tempCancelPerform ) return;

        return this.performSingleLineLoop();
    }

    /**
     * 單獎輪播
     * @param lineData 
     * @param isAllLine 
     * @returns 
     */
    public async performSingleLine ( lineData, isAllLine: boolean = false ) { return; }
}

