import mobx from 'mobx/dist/mobx.cjs.production.min.js';
import { CONFIG, FallSymbol } from './Constants';
import { gameInformation } from './GameInformation';
import { playerInformation } from './PlayerInformation';
import { EventHandheld, EventHandler, sp } from 'cc';

type EliminateData = {
    ID: number,
    WAY: number
};

export class SlotData {
    // 有沒有near win
    NEAR_WIN: boolean = false;
    // 符合near win的輪
    NEAR_WIN_REEL: Array<number> = [];
    /****** 後端傳回來的資訊 ******/
    // pay line資訊先直接存在這裡
    GET_PAY_LINE?: Object = null;
    // 有沒有中free game
    IS_SUB_GAME: boolean = false;;
    TRIGGER_FREE: boolean = false;
    SUB_GAME_DATA: Array<Object> = [ {} ];
    SUB_GAME_TOTAL: number = 0;
    //free game跑到第幾次
    THIS_FREE_GAME_TIMES: number = 0;
    PAY_CREDIT: Array<Object> = [];
    // 整個輪面中獎金額
    PAY_CREDIT_TOTAL: number = 0;
    CUMULATIVE_TOTAL_WIN: number = 0;
    // 初始free game次數
    INITIAL_FREE_GAME_TIMES: number = 10;
    // 目前剩下的free game次數
    REMAIN_FREE_GAME_TIMES: number = 0;
    IS_ICE_WILD: boolean = false;
    @mobx.observable INITIAL_WHEEL: Array<Array<number>> = [
        [ 1, 2, 2, 7, 5 ],
        [ 2, 9, 5, 5, 4 ],
        [ 3, 6, 0, 0, 3 ],
        [ 4, 7, 9, 4, 2 ],
        [ 5, 7, 1, 1, 1 ],
    ];
    @mobx.observable SERVER_WHEEL: Array<Array<number>> = [
        [ 10, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0 ],
        [ 3, 1, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1 ],
        [ 3, 1, 5, 2, 4, 2, 2, 2, 2, 2, 2, 2 ],
        [ 3, 2, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3 ],
        [ 2, 10, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4 ],

    ];
    @mobx.observable FALL_DATA: Array<Array<number>> = [
        [],
        [],
        [],
        [],
        []
    ];
    @mobx.observable FINAL_RESULT: Array<Array<number>> = [
        [],
        [],
        [],
        [],
        []
    ];
    THIS_FREE_GAME_ELIMINATE_TIMES: number = 1;
    FREE_GAME_ALL_ELIMINATE_TIMES: number = 0;
    //消除的symbol id
    @mobx.observable ELIMINATION: Array<Array<EliminateData>> = [];
    @mobx.observable WIN_PER_ELIMINATION: Array<number> = [];
    @mobx.observable ADD_RESULT: Array<Array<number>> = [];
    eliminateIndex: number = 0;
    eliminateCount: number = 0;
    afterServerWheel: Array<Array<number>> = [ [], [], [], [], [] ];
    nextServerWheel: Array<Array<number>> = [ [], [], [], [], [] ];
    fallResult: Array<Array<FallSymbol>> = [ [], [], [], [], [] ];
    fallDistance: Array<number> = [ 0, 0, 0, 0, 0 ];
    fallReelResult: Array<Array<FallSymbol>> = [ [], [], [], [], [] ];
    fallReelDistance: Array<number> = [ 0, 0, 0, 0, 0 ];

    /** spin 回傳事件 */
    spinResponseEventHandler: EventHandler;
    machine:any;

    errorCodeHandler : EventHandler;

    constructor () {
        mobx.makeObservable( this );
    }

    resetSpinData () {
        this.ELIMINATION = [];
        this.FALL_DATA = [ [], [], [], [], [] ];
        this.SERVER_WHEEL = [ [], [], [], [], [] ];
        this.FINAL_RESULT = [ [], [], [], [], [] ];
        this.WIN_PER_ELIMINATION = [];
        this.ADD_RESULT = [];
    }

    @mobx.action public getSpinData ( spinData ) {
        playerInformation.setBalance( spinData.user_credit );
        gameInformation.betCredit = spinData.bet_credit;
        this.IS_SUB_GAME = spinData.get_sub_game;

        this.machine?.spinResponse(spinData);

        // console.log(this.spinResponseEventHandler, 'this.spinResponseEventHandler');
        //if ( this.spinResponseEventHandler != null ) this.spinResponseEventHandler.emit([spinData]);
        // console.log(this.FREE_GAME_ALL_ELIMINATE_TIMES ,'this.CONFIG.FREE_GAME_ALL_ELIMINATE_TIMES ');
        this.getOnceSpinData( spinData.main_game );
    }

    @mobx.action public getErrorCode(response) {
        if ( this.errorCodeHandler == null ) return;
        this.errorCodeHandler.emit([response]);
    }

    @mobx.action getOnceSpinData ( mainGameOrFreeGame ) {
        this.resetSpinData();
        return;
        this.NEAR_WIN = mainGameOrFreeGame.extra.near_win !== 0;
        this.TRIGGER_FREE = mainGameOrFreeGame.extra.scatter_info.amount >= 3;
        this.SERVER_WHEEL = mainGameOrFreeGame.extra.game_result;
        this.setNearWinReel( this.NEAR_WIN );
        console.log( this.SERVER_WHEEL, 'this.CONFIG.SERVER_WHEEL' )
        this.FINAL_RESULT = mainGameOrFreeGame.extra.game_result;

        for ( let i = 0; i < mainGameOrFreeGame.extra.cascading.length; i++ ) {
            this.ELIMINATION[ i ] = [];
            this.WIN_PER_ELIMINATION[ i ] = 0;
            for ( let j = 0; j < mainGameOrFreeGame.extra.cascading[ i ].ways.length; j++ ) {
                this.ELIMINATION[ i ][ j ] = {
                    ID: mainGameOrFreeGame.extra.cascading[ i ].ways[ j ].symbol_id,
                    WAY: mainGameOrFreeGame.extra.cascading[ i ].ways[ j ].way.length
                };
                this.WIN_PER_ELIMINATION[ i ] += mainGameOrFreeGame.extra.cascading[ i ].ways[ j ].pay_credit;
            }
            for ( let k = 0; k < CONFIG.NUM_REEL.vertical; k++ ) {
                this.FALL_DATA[ k ] = this.FALL_DATA[ k ].concat( mainGameOrFreeGame.extra.cascading[ i ].add_result[ k ].reverse() );
                if ( i === mainGameOrFreeGame.extra.cascading.length - 1 ) {
                    this.FINAL_RESULT = mainGameOrFreeGame.extra.cascading[ i ].new_result;
                    this.FINAL_RESULT[ k ].unshift( mainGameOrFreeGame.extra.game_result[ k ][ 0 ] );
                    this.FINAL_RESULT[ k ].push( mainGameOrFreeGame.extra.game_result[ k ][ CONFIG.NUM_ROW - 1 ] );
                    this.FINAL_RESULT[ k ].push( 5, 5, 5, 5, 5, 5 );
                }
            }
            this.ADD_RESULT[ i ] = mainGameOrFreeGame.extra.cascading[ i ].add_result;
        }
        console.log( this.FINAL_RESULT, 'this.CONFIG.FINAL_RESULT' );
        //todo 一場消除的所有次數會掉落的累積先存入
        //再把掉落的第一個替換在SERVER_WHEEL的第一顆
        for ( let i = 0; i < CONFIG.NUM_REEL.vertical; i++ ) {
            //console.log(this.getRandomReel(i),'this.getRandomReel(i)')
            this.SERVER_WHEEL[ i ] = this.SERVER_WHEEL[ i ].concat( this.getRandomReel( i ) );
            if ( this.FALL_DATA[ i ].length > 0 ) {
                this.SERVER_WHEEL[ i ][ 0 ] = this.FALL_DATA[ i ][ 0 ];
                this.FALL_DATA[ i ].splice( 0, 1 );
                this.FALL_DATA[ i ].push( mainGameOrFreeGame.extra.game_result[ i ][ 0 ]/*真實輪面的接續那一顆 */ );
            }
        }
        this.PAY_CREDIT_TOTAL = mainGameOrFreeGame.pay_credit_total;
        if ( 'is_ice_wild' in mainGameOrFreeGame ) {//檢查不是undefined
            this.IS_ICE_WILD = mainGameOrFreeGame.is_ice_wild;//冰龍噴冰
        }
    }

    setNearWinReel ( nearWin ) {
        this.NEAR_WIN_REEL = [];
        if ( nearWin ) {
            let scatterNum = 0;
            for ( let i = 0; i < this.SERVER_WHEEL.length; i++ ) {
                if ( scatterNum >= 2 ) {
                    this.NEAR_WIN_REEL.push( i );
                    continue;
                }
                for ( let j = 1; j < CONFIG.NUM_ROW - 1; j++ ) {
                    if ( this.SERVER_WHEEL[ i ][ j ] === CONFIG.SCATTER_SYMBOL ) {
                        scatterNum++;
                    }
                }
            }
        }
    }

    freeGameNextSpin () {
        //this.emitter.emit(this.emitter.event.setSpinStatus, this.CONFIG.SPINING);
        //this.emitter.emit(this.emitter.event.setSpinMode, this.CONFIG.CURRENT_SPIN_MODE);
        //this.emitter.emit(this.emitter.event.spin);
        this.getOnceSpinData( this.SUB_GAME_DATA[ this.THIS_FREE_GAME_TIMES ] );

        //this.emitter.emit(this.emitter.event.handleDataComeBackTime,Date.now());
        this.REMAIN_FREE_GAME_TIMES -= 1;
        //this.emitter.emit(this.emitter.event.refreshFreeGameTimes, this.CONFIG.REMAIN_FREE_GAME_TIMES);
        if ( this.THIS_FREE_GAME_TIMES === this.SUB_GAME_DATA.length ) {
        } else {
            this.THIS_FREE_GAME_TIMES += 1;
        }
    }

    //之後不用亂數要拿掉的function
    getRandomReel ( gameScreenIndex ) {
        let wheel = [];
        for ( let i = 0; i < CONFIG.NUM_ROW; i++ ) {
            if ( gameScreenIndex === 0 || gameScreenIndex === CONFIG.NUM_REEL.vertical - 1 ) {
                wheel.push( CONFIG.PROBABILITY_SYMBOL_ID_FOR_SPECIFIX[ Math.floor( Math.random() * CONFIG.PROBABILITY_SYMBOL_ID_FOR_SPECIFIX.length ) ] );
            } else {
                wheel.push( CONFIG.PROBABILITY_SYMBOL_ID_FOR_NORMAL[ Math.floor( Math.random() * CONFIG.PROBABILITY_SYMBOL_ID_FOR_NORMAL.length ) ] );
            }
        }
        return wheel;
    }
};

export const slotData = new SlotData;