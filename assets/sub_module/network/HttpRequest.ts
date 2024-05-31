import { _decorator } from 'cc';
import { SpinMode } from '../game/Constants';
import { gameInformation } from '../game/GameInformation';
import { playerInformation } from '../game/PlayerInformation';
import { slotData } from '../game/SlotData';
import { DataManager } from '../data/DataManager';
const { ccclass, property } = _decorator;

export namespace HttpConstants {
    export const GET_RENEW_TOKEN : string = 'renew_token';
    export const GET_USER_DATA: string = 'get_user_data';
    export const GET_GAME_DATA: string = 'get_game_data';
    export const GET_JACKPOT: string = 'get_jackpot';
    export const GET_CASH_DROP: string = 'get_cash_drop';
    export const GET_TOURNAMENT: string = 'get_tournament';
    export const GET_PROMOTION_BRIEF: string = 'get_promotion_brief';
    export const GET_CASH_DROP_PRIZE_RECORD: string = 'get_cash_drop_prize_record';
    export const GET_TOURNAMENT_PRIZE_RECORD: string = 'get_tournament_prize_record';
    export const GET_JP: string = 'get_jp';
    export const GET_JP_AMOUNT: string = 'get_jp_amount';
    export const GET_JP_PRIZE_RECORD: string = 'get_jp_prize_record';
    export const GET_IN_GAME_MENU_STATUS: string = 'get_in_game_menu_status';
    export const GET_EXTRA_DATA: string = 'get_extra_data';
    export const SPIN: string = 'spin';
    export const GET_IN_GAME_MENU: string = 'get_in_game_menu';
    export const UPDATE_IN_GAME_MENU_FAVORITE_GAME: string = 'update_in_game_menu_favorite_game';
    export const GET_IN_GAME_MENU_GAME_URL: string = 'get_in_game_menu_game_url';
}
const READY_STATE_CONNECT: number = 1;
const READY_STATE_ARRIVED: number = 2;
const READY_STATE_PROCESS: number = 3;
const READY_STATE_SUCCESS: number = 4;

@ccclass( 'HttpRequest' )
export class HttpRequest {
    static xhr = new XMLHttpRequest();
    static parseResponse = {
        'renew_token' : HttpRequest.getRenewToken,
        'get_user_data': HttpRequest.getUserData,
        'get_game_data': HttpRequest.getGameData,
        'get_jackpot': HttpRequest.getJackpot,
        'get_cash_drop': HttpRequest.getCashDrop,
        'get_tournament': HttpRequest.getTournament,
        'get_promotion_brief': HttpRequest.getPromotionBrief,
        'get_cash_drop_prize_record': HttpRequest.getCashDropPrizeRecord,
        'get_tournament_prize_record': HttpRequest.getTournamentPrizeRecord,
        'get_jp': HttpRequest.getJP,
        'get_jp_amount': HttpRequest.getJPAmount,
        'get_in_game_menu_status': HttpRequest.getInGameMenuStatus,
        'get_extra_data': HttpRequest.getExtraData,
        'spin': HttpRequest.getSpin,
        'get_in_game_menu': HttpRequest.getInGameMenu,
        'update_in_game_menu_favorite_game': HttpRequest.updateInGameMenuFavoriteGame,
        'get_in_game_menu_game_url': HttpRequest.getInGameMenuGameUrl
    };

    public static establishConnect ( data: string ) {
        return new Promise( ( resolve, reject ) => {
            HttpRequest.xhr.timeout = 4 * 60 * 1000;
            HttpRequest.xhr.ontimeout = function ( e ) {
                console.log( 'ERROR_INTERNET' );
                reject( 'ERROR_INTERNET' );
            };
            HttpRequest.xhr.onreadystatechange = function () {
                if ( HttpRequest.xhr.status === 404 ) {
                    reject( '404' );
                } else {
                    if ( HttpRequest.xhr.readyState === READY_STATE_CONNECT ) {
                        console.log( 'readyState = READY_STATE_CONNECT' );
                    } else if ( HttpRequest.xhr.readyState === READY_STATE_ARRIVED ) {
                        console.log( 'readyState = READY_STATE_ARRIVED' );
                    } else if ( HttpRequest.xhr.readyState === READY_STATE_PROCESS ) {
                        console.log( 'readyState = READY_STATE_PROCESS' );
                    } else if ( HttpRequest.xhr.readyState === READY_STATE_SUCCESS ) {
                        console.log( 'readyState = READY_STATE_SUCCESS' );
                        let response = HttpRequest.xhr.response;
                        if ( response == null ) {
                            console.log( 'ERROR_INTERNET' );
                            reject( 'ERROR_INTERNET' );
                            return;
                        }

                        if ( response.error_code != 0 ) {
                            console.log( 'ERROR_INTERNET' );
                            reject( response.error_code );
                        }

                        if ( response.data == null ) {
                            console.log( 'ERROR_INTERNET' );
                            reject( 'ERROR_INTERNET' );
                            return;
                        }
                        let command: keyof typeof HttpRequest.parseResponse = response.command;
                        if ( HttpRequest.parseResponse[ command ] ) {
                            HttpRequest.parseResponse[ command ]( response );
                            resolve( 'success' );
                        } else {
                            console.log( 'ERROR_INTERNET' );
                            reject( 'ERROR_INTERNET' );
                        }
                    }
                }
            };
            HttpRequest.xhr.onerror = function () {
                console.log( 'ERROR_INTERNET' );
                reject( 'ERROR_INTERNET' );
            };
            HttpRequest.xhr.open( 'POST', gameInformation.serverurl );
            HttpRequest.xhr.responseType = 'json';
            console.log( JSON.parse( data ).command );
            HttpRequest.xhr.send( data );
        } );
    }

    static getRenewToken ( response: any ): any {
        let userResponse = response.data[ 0 ];
        gameInformation.token = userResponse.token;
        sessionStorage.setItem( gameInformation._paramToken, gameInformation.token );
    }

    static getUserData ( response: any ): any {
        let userResponse = response.data[ 0 ];
        gameInformation.windowSearch.set( 'Account', userResponse.account );
        gameInformation.windowSearch.set( 'Agent', userResponse.agent_account );
        // playerInformation.setBalance( userResponse.credit );
        //DataManager.instance.updataCredit(userResponse.credit);
        DataManager.instance.userData.credit = userResponse.credit;
        gameInformation.setCurrency( userResponse.currency );
    }

    static getGameData ( response: any ): any {
        let gameResponse = response.data[ 0 ];
        gameInformation.coinValueArray = gameResponse.coin_value;
        gameInformation.lineBetArray = gameResponse.line_bet;
        gameInformation.coinValueDefaultIndex = gameResponse.coin_value_default_index;
        gameInformation.coinValue = gameInformation.coinValueArray[ gameInformation.coinValueDefaultIndex ];
        gameInformation.lineBetDefaultIndex = gameResponse.line_bet_default_index;
        gameInformation.lineBet = gameInformation.lineBetArray[ gameInformation.lineBetDefaultIndex ];
        gameInformation.lineTotal = gameResponse.line_total;
        gameInformation.winLevelRate.WIN = gameResponse.win;
        gameInformation.winLevelRate.BIG_WIN = gameResponse.big_win;
        gameInformation.winLevelRate.SUPER_WIN = gameResponse.super_win;
        gameInformation.winLevelRate.MEGA_WIN = gameResponse.mega_win;
        gameInformation.spinMode = <SpinMode> gameResponse.spin_mode;
        gameInformation.buyInformation.allowBuy = gameResponse.buy_spin.allow_buy;
        gameInformation.buyInformation.multiplier = gameResponse.buy_spin.multiplier;
        gameInformation.buyInformation.limitTotal = gameResponse.buy_spin.limit_total;
    }

    static getJackpot ( response: any ): any {
    }

    static getCashDrop ( response: any ): any {
        let cashDropResponse = response.data;
        for ( let i = 0; i < cashDropResponse.length; i++ ) {
            for ( let j = 0; j < gameInformation.promotion.information.length; j++ ) {
                if ( cashDropResponse[ i ].promotion_id === gameInformation.promotion.information[ j ].promotion_id ) {
                    gameInformation.promotion.information[ j ].mode = cashDropResponse[ i ].mode;
                    gameInformation.promotion.information[ j ].mode_rule = cashDropResponse[ i ].mode_rule;
                    gameInformation.promotion.information[ j ].promotion_content = cashDropResponse[ i ].promotion_content;
                }
            }
        }
    }

    static getTournament ( response: any ): any {
        let tournamentResponse = response.data;
        for ( let i = 0; i < tournamentResponse.length; i++ ) {
            for ( let j = 0; j < gameInformation.promotion.information.length; j++ ) {
                if ( tournamentResponse[ i ].promotion_id === gameInformation.promotion.information[ j ].promotion_id ) {
                    gameInformation.promotion.information[ j ].mode = gameInformation.promotion.modeTournament;//錦標賽給特定模式-1
                    gameInformation.promotion.information[ j ].bonus_setting = tournamentResponse[ i ].bonus_setting;
                    gameInformation.promotion.information[ j ].promotion_content = tournamentResponse[ i ].promotion_content;
                    gameInformation.promotion.information[ j ].payout_status = tournamentResponse[ i ].payout_status;
                }
            }
        }
    }

    static getPromotionBrief ( response: any ): any {
        let promotionBriefResponse = response.data;
        promotionBriefResponse.sort( function ( a, b ) {
            const timeZoneNow = new Date( new Date().toLocaleString( 'sv-SE', { timeZone: a.time_zone } ).replace( /-/g, '/' ) );
            const TIME_A = new Date( a.end_date.replace( /-/g, '/' ) ).getTime() - timeZoneNow.getTime();
            const TIME_B = new Date( b.end_date.replace( /-/g, '/' ) ).getTime() - timeZoneNow.getTime();
            return TIME_B > TIME_A ? 1 : -1;
        } );
        // 把錦標賽拿到後面放
        let pushType = 1;
        let temp = promotionBriefResponse.filter( value => value.promotion_type === pushType );
        for ( let i = promotionBriefResponse.length - 1; i >= 0; i-- ) {
            if ( promotionBriefResponse[ i ].promotion_type === pushType ) {
                promotionBriefResponse.splice( i, 1 );
            }
        }
        promotionBriefResponse = promotionBriefResponse.concat( temp );
        for ( let i = 0; i < promotionBriefResponse.length; i++ ) {
            // * `promotion_type === 2` means jackpot
            if ( promotionBriefResponse[ i ].promotion_type === 2 ) {
                gameInformation.promotion.jackpotInformation.push( {
                    promotion_id: promotionBriefResponse[ i ].promotion_id,
                    end_date: promotionBriefResponse[ i ].end_date,
                    promotion_name: promotionBriefResponse[ i ].promotion_name,
                    time_zone: promotionBriefResponse[ i ].time_zone,
                    min_bet: promotionBriefResponse[ i ].min_bet,
                    currency: promotionBriefResponse[ i ].currency,
                    promotion_type: promotionBriefResponse[ i ].promotion_type,
                    promotion_content: '',
                    mode: 0,
                    mode_rule: [],
                    bonus_setting: {
                        bonus: 0,
                        start_rank: 0,
                        end_rank: 0
                    },
                    payout_status: 0,
                    user: [],
                    winner: []
                } );
            } else {
                gameInformation.promotion.information.push( {
                    promotion_id: promotionBriefResponse[ i ].promotion_id,
                    end_date: promotionBriefResponse[ i ].end_date,
                    promotion_name: promotionBriefResponse[ i ].promotion_name,
                    time_zone: promotionBriefResponse[ i ].time_zone,
                    min_bet: promotionBriefResponse[ i ].min_bet,
                    currency: promotionBriefResponse[ i ].currency,
                    promotion_type: promotionBriefResponse[ i ].promotion_type,
                    promotion_content: '',
                    mode: 0,
                    mode_rule: [],
                    bonus_setting: {
                        bonus: 0,
                        start_rank: 0,
                        end_rank: 0
                    },
                    payout_status: 0,
                    user: [],
                    winner: []
                } );
            }
        }
    }

    static getCashDropPrizeRecord ( response: any ): any {
        let cashDropPrizeRecordResponse = response.data;
        cashDropPrizeRecordResponse.sort( function ( a, b ) {
            return a.promotion_id > b.promotion_id ? 1 : -1;
        } )
        for ( let i = 0; i < cashDropPrizeRecordResponse.length; i++ ) {
            for ( let j = 0; j < gameInformation.promotion.information.length; j++ ) {
                if ( cashDropPrizeRecordResponse[ i ].promotion_id === gameInformation.promotion.information[ j ].promotion_id ) {
                    gameInformation.promotion.information[ j ].user = cashDropPrizeRecordResponse[ i ].user;
                    gameInformation.promotion.information[ j ].user.sort( ( a, b ) => {
                        return b.date > a.date ? 1 : -1;
                    } )
                    gameInformation.promotion.information[ j ].winner = cashDropPrizeRecordResponse[ i ].winner;
                }
            }
        }
    }

    static getTournamentPrizeRecord ( response: any ): any {
        let tournamentPrizeRecordResponse = response.data;
        tournamentPrizeRecordResponse.sort( function ( a, b ) {
            return a.promotion_id > b.promotion_id ? 1 : -1;
        } )
        for ( let i = 0; i < tournamentPrizeRecordResponse.length; i++ ) {
            for ( let j = 0; j < gameInformation.promotion.information.length; j++ ) {
                if ( tournamentPrizeRecordResponse[ i ].promotion_id === gameInformation.promotion.information[ j ].promotion_id ) {
                    gameInformation.promotion.information[ j ].user = tournamentPrizeRecordResponse[ i ].user;
                    gameInformation.promotion.information[ j ].winner = tournamentPrizeRecordResponse[ i ].winner;
                }
            }
        }
    }

    static getJP ( response: any ): any {
        if ( response.data && response.data.length > 0 ) {
            let responseData = response.data[ 0 ];
            gameInformation.promotion.jpInfo[ 'content' ] = responseData.promotion_content;
        }
    }

    static getJPAmount ( response: any ): any {
        if ( response.data && response.data.length > 0 ) {
            let responseData = response.data[ 0 ];
            let dataKeys = Object.keys( responseData );
            for ( let i = 0; i < dataKeys.length; i++ ) {
                gameInformation.promotion.jpInfo[ dataKeys[ i ] ] = responseData[ dataKeys[ i ] ];
            }
        }
    }

    static getJPPrizeRecord ( response: any ): any {
        let jpPrizeRecordResponse = response.data;
        for ( let i = 0; i < jpPrizeRecordResponse.length; i++ ) {
            for ( let j = 0; j < gameInformation.promotion.jackpotInformation.length; j++ ) {
                if ( jpPrizeRecordResponse[ i ].promotion_id === gameInformation.promotion.jackpotInformation[ j ].promotion_id ) {
                    gameInformation.promotion.jackpotInformation[ j ].user = jpPrizeRecordResponse[ i ].user;
                    gameInformation.promotion.jackpotInformation[ j ].winner = jpPrizeRecordResponse[ i ].winner;
                }
            }
        }
    }

    static getInGameMenuStatus ( response: any ): any {
        if ( response.data && response.data.length > 0 ) {
            let inGameMenuStatusResponse = response.data[ 0 ];
            gameInformation.inGameMenuStore.isAvailable = inGameMenuStatusResponse[ 'status' ] === 1;
        }
    }

    static getExtraData ( response: any ): any {
    }

    static getSpin ( response: any ): any {
        if ( response.error_code != 0 ) {
            return slotData.getErrorCode(response);
        }

        slotData.getSpinData( response.data );
    }

    static getInGameMenu ( response: any ): any {
        if ( response.game && response.game.length > 0 ) {
            // * Process Hot, New and All game list
            let menuGames = response.game;
            for ( let i = 0; i < menuGames.length; i++ ) {
                if ( menuGames[ i ][ 1 ] == 1 ) {
                    gameInformation.inGameMenuStore.new.push( menuGames[ i ][ 0 ] );
                } else if ( menuGames[ i ][ 1 ] == 2 ) {
                    gameInformation.inGameMenuStore.hot.push( menuGames[ i ][ 0 ] );
                }
                gameInformation.inGameMenuStore.gameList.push( menuGames[ i ][ 0 ] );
            }

            // * Process favorite game list
            let favGames = response.favorite;
            for ( let i = 0; i < favGames.length; i++ ) {
                gameInformation.inGameMenuStore.favList.push( favGames[ i ] );
            }

            // * Keeps imageURL
            gameInformation.inGameMenuStore.imageURL = response.image;

            // * Create game data
            let allGamesData = response.game_name;
            for ( let i = 0; i < allGamesData.length; i++ ) {
                gameInformation.gameListStore[ allGamesData[ i ].game_id ] = allGamesData[ i ].language;
            }
        }
    }

    static updateInGameMenuFavoriteGame ( response: any ): any {
    }

    static updateFavoriteList () {
        let updateFavoriteListData = {
            'command': HttpConstants.UPDATE_IN_GAME_MENU_FAVORITE_GAME,
            'token': gameInformation.token,
            'data': {
                favorite: gameInformation.inGameMenuStore.favList,
            }
        };
        HttpRequest.establishConnect( JSON.stringify( updateFavoriteListData ) );
    }

    static getInGameMenuGameUrl ( response: any ): any {
        if ( response.data && response.data.length > 0 ) {
            let gameURL = response.data[ 0 ][ 'url' ];
        }
    }

    static getGameUrl ( gameId: number ) {
        let getGameUrlData = {
            'command': HttpConstants.GET_IN_GAME_MENU_GAME_URL,
            'token': gameInformation.token,
            'data': {
                game_id: gameId,
                lang: gameInformation.urlLanguage
            }
        };
        HttpRequest.establishConnect( JSON.stringify( getGameUrlData ) );
    }
}

