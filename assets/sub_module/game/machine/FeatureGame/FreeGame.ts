import { _decorator, Component, Node } from 'cc';
import { FeatureGame } from './FeatureGame';
import { Utils } from '../../../utils/Utils';
const { ccclass, property } = _decorator;

@ccclass( 'FreeGame' )
export class FreeGame extends FeatureGame {

    protected freeGameResult;
    protected freeGameStep = 0;

    protected onLoad (): void {
        this.endFeatureGameUINode.active = false;
        super.onLoad();
    }

    /**
     * 總 FreeSpin 次數
     */
    public get totalSpinTimes () { return this.freeGameResult[ 'sub_game' ][ 'result' ].length; }

    /**
     * 剩餘 FreeSpin 次數
     */
    public get lastSpinTimes () { return this.totalSpinTimes - this.freeGameStep - 1; }

    /**
     * 顯示剩餘 FreeSpin 次數事件
     */
    public displayLastSpinTimes ( times: number ) { }

    public isFeatureGame ( result: any ): boolean {
        // if ( this.machine.status != MACHINE_STATUS.MAIN_GAME ) return true;
        if ( result[ 'get_sub_game' ] !== true ) return false;
        if ( result[ 'sub_game' ] == null ) return false;
        if ( result[ 'sub_game' ][ 'result' ] == null || result[ 'sub_game' ][ 'result' ].length === 0 ) return false;

        this.freeGameResult = result;
        return true;
    }

    /**
     * 在 FeatureGame 的開場介面的 Button 點擊指到這個 function
     * 然後在這裡面撰寫轉場動畫
     */
    public async preStartFeature () { return; }

    /**
     * 進入 FeatureGame 需要執行的動畫
     */
    public async enterFeatureGame () { super.enterFeatureGame(); }

    public async startFeatureGame () {
        if ( this.enterFeatureGameUI != null ) {
            this.enterFeatureGameUI.active = false;
        }

        this.freeGameSpin( 0 );
    }

    public putFreeSpinResult ( idx: number ) {
        let subGameData = this.freeGameResult[ 'sub_game' ][ 'result' ][ idx ];
        return subGameData;
    }

    public async freeGameSpin ( idx ) {
        let data = this.putFreeSpinResult( idx );

        this.freeGameStep = idx;
        this.machine.spin( true );
        //this.machine.reel.setResult(data['extra']['game_result']);
        this.machine.reel.setResult( data[ 'result_reels' ] );
        this.displayLastSpinTimes( this.lastSpinTimes );
        // this.reel.setResult(newResult);
    }

    public async spinDone () {
        let data = this.putFreeSpinResult( this.freeGameStep );

        if ( data[ 'pay_credit_total' ] > 0 ) {
            await this.machine.featureGameCheckBigWin( data[ 'pay_credit_total' ] );
            return await this.machine.payTable.performAllPayline( data, data[ 'pay_credit_total' ], this.perfromPaytableCallback );
        } else {
            this.perfromPaytableEvent();
        }
    }

    public async perfromPaytableEvent () {

        await Utils.delay( 1000 );
        let idx = this.freeGameStep + 1;
        if ( idx >= this.freeGameResult[ 'sub_game' ][ 'result' ].length ) {
            let totalWin = this.freeGameResult[ 'sub_game' ][ 'pay_credit_total' ];
            console.log( totalWin );
            await this.EndFeatureGame( totalWin );
            return;
        }

        await this.freeGameSpin( idx );
    }

    public async eventSpingStop ( wheelIndex: number ) {
        // if ( this.machine.featureGame != this ) return false;
        // if ( this.machine.status != MACHINE_STATUS.FREE_GAME ) return false;

        await this.spinDone();
        return true;
    }

}

