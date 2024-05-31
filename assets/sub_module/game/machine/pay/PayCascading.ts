import { _decorator, Component, Node, tween, TweenEasing, Vec3 } from 'cc';
import { Paytable } from './PayTable';
import { Utils } from '../../../utils/Utils';
import { wheelCascade } from '../wheel/wheelCascade';
import { MACHINE_STATUS } from '../Machine';
import { Symbol } from '../Symbol';
const { ccclass, property } = _decorator;

@ccclass( 'PayCascading' )
export class PayCascading extends Paytable {
    @property( { displayName: 'CascadingWinSec', tooltip: '設定Symbol贏分動態秒數' } )
    public cascadingWinSec = 1;

    tmp_pay_credit = 0;
    public async performAllLine ( payRuleData, totalWin: number, firstTime = false ) {
        let spinData = this.machine.spinData;
        let cascadingList;
        this.tmp_pay_credit = 0;
        if ( this.machine.status === MACHINE_STATUS.MAIN_GAME ) {
            cascadingList = spinData[ 'main_game' ][ 'cascading' ];
        } else {
            cascadingList = payRuleData[ 'cascading' ];
        }

        for ( let idx in cascadingList ) {
            await this.cascadingCheck( cascadingList[ idx ] );
            break;
        }
        this.winNumberAllLine.string = '';
        this.winNumberSingleLine.string = '';
        return;
    }

    protected async cascadingDelete ( cascadingData ): Promise<number> {
        let ways = cascadingData[ 'ways' ];
        let self = this;
        let toCredit = 0;
        for ( let idx in ways ) {
            let wayData = ways[ idx ];
            let del = wayData[ 'delete_position' ];
            toCredit += wayData[ 'pay_credit' ];

            let firstPos = null;
            // console.log(del);
            for ( let x = 0; x < del.length; x++ ) {
                let delData = del[ x ];

                for ( let i = 0; i < delData.length; i++ ) {
                    if ( delData[ i ] != 1 ) continue;
                    this.cascadingSymbol( x, i );

                    if ( firstPos === null ) {
                        firstPos = [ x, i ];
                        // console.log('firstPos', firstPos);
                        //self.setSingleLinePos(x,i,wayData['pay_credit']);//fix@20240216,不需要
                    }
                }
            }
        }
        await Utils.delay( 1500 );
        return toCredit;
    }

    protected async fillSymbol ( cascadingData ) {
        let wheels: any = this.machine.reel.getWheels();
        let add_result = cascadingData[ 'add_reels' ];

        // console.log('add_result',add_result);
        for ( let idx = 0; idx < add_result.length; idx++ ) {
            //await Utils.delay(Utils.Random(0, 100));
            await Utils.delay( 50 );
            if ( add_result[ idx ] == null || add_result[ idx ].length === 0 ) continue;
            wheels[ idx ].fillSymbol( add_result[ idx ] );
        }
    }

    public async cascadingCheck ( cascadingData ) {
        this.reelMask.active = true;
        /**
        * fix@20240215
        * 贏分數字顯示與跑速調整：
          1.出現時間改為跟圖騰連線動畫一起出現。目前是新圖騰掉落後才出現
          2.無論獲得多少分數，皆在消失動畫結束後跑完（連線動畫＋消失動畫的整體時間）。
          3.分數出現增加放大動畫
          3-1.以放大250%的尺寸出現，位置可以稍微高個 10 Pixel
          3-2.在0.3秒內縮小回到100%尺寸，縮小過程中位移至原本位置
          3-3.放大縮小過程中同時進行跑分
        */
        let durationMove1 = 0.7;//秒,3-2
        let durationMove2 = 0.3;//秒,3-2
        let durationScale1 = 0.6;
        let durationScale2 = 1.0;
        let offsetPixel = 10;//pixel, 3-1
        let scale = 3;//尺寸(%),3-1
        let durationCountdown = 1500 + 400 + 100;//millisecond,連線動畫(cascadingDelete)的整體時間
        let position = this.winNumberAllLine.node.getPosition();//原本位置
        let credit = 0;
        let ways = cascadingData[ 'ways' ];
        for ( let idx in ways ) {
            let wayData = ways[ idx ];
            credit += wayData[ 'pay_credit' ];
        }
        let add_result = cascadingData[ 'add_reels' ];
        durationCountdown += add_result.length * 50;//millisecond,連線動畫+消失動畫(fillSymbol)的整體時間
        //this.winNumberAllLine.node.setPosition(position.x,position.y+offsetPixel,position.z);
        //this.winNumberAllLine.node.setScale(scale,scale,1.0);
        this.tweenTextScale( this.winNumberAllLine.node, durationScale1, 0, new Vec3( scale, scale, 1.0 ), "linear" );
        this.tweenTextScale( this.winNumberAllLine.node, durationScale2, durationScale1, new Vec3( 1.0, 1.0, 1.0 ), "linear" );
        //this.tweenTextMove(this.winNumberAllLine.node, durationMove1, 0,new Vec3(position.x, position.y+offsetPixel, position.y) , "linear");
        //this.tweenTextMove(this.winNumberAllLine.node, durationMove2,durationMove1, new Vec3(position.x, position.y, position.y) , "linear");
        this.tweenTextCountdown( ( durationCountdown / 1000 ), credit );//秒
        //
        //let toCredit = await this.cascadingDelete(cascadingData);
        this.reelMask.active = false;
        await Utils.delay( 400 );
        //await this.fillSymbol(cascadingData);
        /*
        let self = this;
        toCredit += this.tmp_pay_credit;
        let tweenNumber = { 'value': this.tmp_pay_credit };
        this.machine.controller.showTotalWin(toCredit);
        tween(tweenNumber).to(1, { value: toCredit }, {
            onUpdate: (o) => {
                let value = Math.floor(tweenNumber.value);
                self.winNumberAllLine.string = Utils.numberComma(value);
            }
        }).start();
`       */
        await Utils.delay( 2000 );
    }
    /**
     * 文字跑分動畫
     */
    public tweenTextCountdown ( duration: number, Credit: number ) {
        let self = this;
        Credit += this.tmp_pay_credit;
        let tweenNumber = { 'value': this.tmp_pay_credit };
        this.machine.controller.showTotalWin( Credit );
        tween( tweenNumber ).to( duration, { value: Credit }, {
            onUpdate: ( o ) => {
                let value = Math.floor( tweenNumber.value );
                self.winNumberAllLine.string = Utils.numberComma( value );
            }
        } ).start();
    }

    /**
     * 文字縮放動畫
     */
    public tweenTextScale ( targetNode: Node, duration: number, onDelay: number, targetScale: Vec3, targetEasing: TweenEasing ) {
        tween( targetNode ).delay( onDelay ).to( duration, { scale: targetScale }, {
            easing: targetEasing,
            onComplete: ( target: Node ) => {
            }
        } ).start();
    }
    /**
     * 文字位移動畫
     */
    public tweenTextMove ( targetNode: Node, duration: number, onDelay, targetPos: Vec3, targetEasing: TweenEasing ) {
        tween( targetNode ).delay( onDelay ).to( duration, { position: targetPos }, {
            easing: targetEasing,
            onComplete: ( target: Node ) => {
            }
        } ).start();
    }

    public async cascadingSymbol ( x, y ) {
        let wheels: any = this.machine.reel.getWheels();
        let symbol = wheels[ x ].getSymbol( 0, y );
        if ( symbol === null ) return;
        let symbolComponent = symbol.getComponent( Symbol );
        symbolComponent.winState();
        // await Utils.delay(this.cascadingWinSec * 1000);
        // wheels[x].cascadingIndex(y);
        return symbol;
    }

    /**
     * 消去型沒辦法輪播
     */
    public async performSingleLineLoop () { return; }
}

