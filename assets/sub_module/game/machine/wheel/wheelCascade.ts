import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Wheel } from '../Wheel';
import { Symbol } from '../Symbol';
import { ObjectPool } from '../../ObjectPool';
import { SoundManager } from '../SoundManager';
import { Symbol4500 } from '../../../../4500/scripts/Symbol4500';
const { ccclass, property } = _decorator;

/**
 * wheelCascade
 * 1. 消除會掉落
 * 2. 長條形 Symbol 功能
 */
@ccclass( 'wheelCascade' )
export class wheelCascade extends Wheel {

    public cascadingIndex ( index ) {
        var symbol = this.getSymbol( index );
        if ( symbol == null ) return;

        this.cascadingSymbol( symbol );
    }

    /**
     * 消除Symbol
     * @param symbol 
     */
    public cascadingSymbol ( symbol ) {
        // console.log(symbol);
        let data = this.getIndexSymbol;
        let findPos = null;
        let minH = this.wheelHeightRange.x;
        let maxH = this.wheelHeightRange.y;
        let movePass: Node[] = [];
        let moveStep = 0;
        for ( let i = maxH; i >= minH; i-- ) {
            let checkSym = data[ i ];
            if ( findPos != null ) {
                if ( movePass.includes( checkSym ) == true ) continue;
                this.removeSymbol( i );
                this.fallPos( checkSym, i + moveStep );
                movePass.push( checkSym );
                continue;
            }

            if ( checkSym !== symbol ) continue;
            movePass.push( checkSym );
            findPos = i;
            moveStep = checkSym.getComponent( Symbol )._symbolSize.y;
            this.removeSymbol( i );
        }

        //this.fillSymbol();
        // console.log(this.symbolData);
    }

    /**
     * 往下掉落
     * @param symbol 掉落的 symbol
     * @param toIdx 掉落到哪個位置
     */
    public fallPos ( symbol: Node, toIdx: number ) {
        if ( symbol == null ) return;

        let symbolComponent = symbol.getComponent( Symbol );
        let toPos = this.getSymbolPutPos( toIdx );
        let dist = Vec3.distance( symbol.position, toPos );
        let tweenSec = dist * 0.0003;
        if ( tweenSec < 0.1 ) tweenSec = 0.1;

        let upPos = toPos.clone();
        upPos.y += 20;
        tween( symbol ).to( tweenSec, { position: toPos }, {
            easing: "quadIn", onComplete: () => {
                tween( symbol ).to( 0.05, { position: upPos }, {
                    easing: "quadOut", onComplete: () => {
                        tween( symbol ).to( 0.05, { position: toPos }, { easing: "quadIn" } ).start();
                    }
                } ).start();
            }
        } ).start();
        symbol.active = true;
    }

    public fillSymbol ( add_symbols: number[] ) {
        let minH = this.propertys.heightIdxType[ 0 ];
        let maxH = this.propertys.heightIdxType[ 1 ];
        let symbolData = this.propertys.symbolData;

        // 上面的 Symbol 往下補位
        for ( let i = maxH - 1; i >= minH; i-- ) {
            if ( symbolData[ i ] && symbolData[ i ].symbol != null ) continue;
            for ( let j = i - 1; j >= minH; j-- ) {
                if ( !symbolData[ j ]?.symbol ) continue;
                let data = symbolData[ j ];
                symbolData[ i ] = data;
                symbolData[ j ] = {};

                // this.removeSymbol(j);
                this.fallPos( data.symbol, i );
                break;
            }
        }

        this.propertys.symbolData = symbolData;

        for ( let idx = 0; idx < add_symbols.length; idx++ ) {
            let newSym: Node = ObjectPool.Get( add_symbols[ idx ] );
            let toIdx = minH + idx;
            let fromPos = this.getSymbolPutPos( -( idx + 1 ) );

            this.container.addChild( newSym );
            newSym.setPosition( fromPos );
            newSym.active = true;
            let symbol: Symbol = newSym.getComponent( Symbol );
            symbol.win();
            this.fallPos( newSym, toIdx );
            this.putSymbol( newSym, toIdx );
        }


    }

}

