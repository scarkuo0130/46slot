import { _decorator, AudioSource, Button, CCInteger, Component, Label, Node, Sprite, SpriteFrame, UIOpacity, Vec3 } from 'cc';
import { UIInGameMenuPanelConfig } from './UIInGameMenuPanelConfig';
import { igmOrientation, igmViewport } from '../utils/igmViewport';
import { igmConfigUtils } from '../utils/igmConfigUtils';
import { InGameInformation } from './InGameInformation';
import { igmUrlParameters } from '../utils/igmUrlParameters';
import { InGameMenuContent } from '../js/InGameMenuContent';
import { PromotionalContent } from '../js/promotionalContent';
import { VIEW_CONFIG } from '../js/config';
import { UIPromotionHint } from './UIPromotionHint';
import { igmSpineAnimation } from '../utils/igmSpineAnimation';
import { InGameMenuDisplayLanguage } from './InGameMenuDisplayLanguage';
import { EventTypes } from '../../events/EventTypes';
import { EventManager } from '../../events/EventManager';
import { igmUtils } from '../utils/igmUtils';
import { FloatingBoard } from './FloatingBoard';
import { igmButtonUtils } from '../utils/igmButtonUtils';
import { FloatingButton } from './FloatingButton';

const { ccclass, property } = _decorator;
//inGameMenu
const GET_IN_GAME_MENU = 'get_in_game_menu';
const UPDATE_IN_GAME_MENU_FAVORITE_GAME = 'update_in_game_menu_favorite_game';
const GET_IN_GAME_MENU_GAME_URL = 'get_in_game_menu_game_url';
//promotion
const GET_CASH_DROP = 'get_cash_drop';
const GET_TOURNAMENT = 'get_tournament';
const GET_CASH_DROP_PRIZE_RECORD = 'get_cash_drop_prize_record';
const GET_TOURNAMENT_PRIZE_RECORD = 'get_tournament_prize_record';

const GET_JP = 'get_jp';
const GET_JP_AMOUNT = 'get_jp_amount';
const GET_JP_PRIZE_RECORD = 'get_jp_prize_record';
const LOCALSTORAGE_JACKPOT_KEY = 'settings_for_jp';
/**
 * 類別,處理InGameMenu/Promotion/Jackpot,包括：
 * 1. 本身改為浮動式按鈕
 * 2. 兩顆按鈕Promotion/Jackpot
 * 3. 兩顆按鈕的彈出式訊息PromotionHint/JackpotHint
 * 4. InGameMenuContent
 * 5. PromotionalContent
 * 6. InGameMenu(我的最愛)按鈕隱藏,但有功能
 * @20231103 fix
 */
@ccclass( 'UIInGameMenuPanel' )
export class UIInGameMenuPanel extends Component {
    /** 本身是浮動式按鈕 */
    @property( { type: FloatingBoard } )
    public floatingBoardCurrent !: FloatingBoard;
    /** 按鈕 Promotion */
    @property( { type: Button } )
    public buttonPromotion !: Button;
    /** 按鈕 InGameMenu */
    @property( { type: FloatingButton } )
    public buttonInGameMenu !: FloatingButton;
    /** 按鈕 Jackpot */
    @property( { type: Button } )
    public buttonJackpot !: Button;

    /** sprite Background */
    @property( { type: [ Sprite ] } )
    public spriteBackgroundFloatingBoard: Sprite[] = [];
    @property( { type: Sprite } )
    public spriteBackgroundPromotion !: Sprite;
    @property( { type: Sprite } )
    public spriteBackgroundInGameMenu !: Sprite;
    @property( { type: Sprite } )
    public spriteBackgroundJackpot !: Sprite;

    /** tweenDistance */
    @property( { type: [ CCInteger ] } )
    public tweenDistanceFloatingBoard: number[] = [];

    //spine
    @property( { type: igmSpineAnimation } )
    public spineAnimationCashDrop !: igmSpineAnimation;
    @property( { type: igmSpineAnimation } )
    public spineAnimationJackpot !: igmSpineAnimation;
    @property( { type: igmSpineAnimation } )
    public spineAnimationTournament !: igmSpineAnimation;

    @property( { type: Label } )
    public labelTimeLeft !: Label;

    //button spriteFrame array
    @property( { type: [ SpriteFrame ] } )
    public spriteFrameCashDrop: SpriteFrame[] = [];
    @property( { type: [ SpriteFrame ] } )
    public spriteFrameTournament: SpriteFrame[] = [];
    @property( { type: [ SpriteFrame ] } )
    public spriteFrameCashDropFinish: SpriteFrame[] = [];
    @property( { type: [ SpriteFrame ] } )
    public spriteFrameTournamentFinish: SpriteFrame[] = [];

    /** 彈出式訊息 Jackpot promotionHint */
    @property( { type: UIPromotionHint } )
    public jackpotHint!: UIPromotionHint;
    /** 彈出式訊息 promotion promotionHint */
    @property( { type: UIPromotionHint } )
    public promotionHint!: UIPromotionHint;

    //sound
    @property( AudioSource )
    public audioSource !: AudioSource;
    protected soundMuted: boolean = false;

    /** 小紅點 */
    @property( { type: Node } )
    public nodeBadgeJackpot !: Node;
    @property( { type: Node } )
    public nodeBadgePromotion !: Node;
    protected isDoneBadgeJackpot = false;
    protected isDoneBadgePromotion = false;

    //原本的 InGameMenu *Content.js change to *.ts
    protected inGameMenuContent: InGameMenuContent = new InGameMenuContent( this );
    protected promotionContent: PromotionalContent = new PromotionalContent( this );

    //原本的 Index.js 的變數
    protected inGameMenuStatus = 0;
    protected scheduleId: any;
    //原本的 Promotion.js 的變數
    protected reciprocalTime: string[] = [];
    protected visiblePromotion = 0;

    //protected value
    protected config: UIInGameMenuPanelConfig;
    protected xhr: XMLHttpRequest | undefined;

    start () {
        igmViewport.instance.onOrientationChangeSignal.add( ( orientation: igmOrientation ) => {
            this.onOrientationChange( orientation );
        } );
        this.config = igmConfigUtils.getConfig<UIInGameMenuPanelConfig>( UIInGameMenuPanelConfig );

        this.initHttpRequest();
        this.inGameMenuContent.setLanguage( igmUrlParameters.language );
        InGameMenuDisplayLanguage.instance.setDisplayLanguage( igmUrlParameters.language );
        this.onOrientationChange( igmViewport.instance.getCurrentOrientation() );

        this.afterGameReadyToSpin();
        this.addListeners();

        // * Start schedule fetch teh extra data per 60 sec
        this.scheduleFetchExtraData();
        
        igmButtonUtils.setNodeEventOnHover( this.buttonPromotion.node );
        igmButtonUtils.setNodeEventOnHover( this.buttonJackpot.node );
        igmButtonUtils.setNodeEventOnHover( this.buttonInGameMenu.buttonCurrent.node );
    }

    onDestroy (): void {
        igmViewport.instance.onOrientationChangeSignal.remove( ( orientation: igmOrientation ) => {
            this.onOrientationChange( orientation );
        } );

        igmButtonUtils.setNodeEventOffHover( this.buttonPromotion.node );
        igmButtonUtils.setNodeEventOffHover( this.buttonJackpot.node );
        igmButtonUtils.setNodeEventOffHover( this.buttonInGameMenu.buttonCurrent.node );
    }

    onResize (): void {
        let height = Math.max( window.innerHeight, document.documentElement.clientHeight )
        let width = Math.max( window.innerWidth, document.documentElement.clientWidth );
        let isPortrait = ( height > width );

        this.inGameMenuContent.onResize( isPortrait );

        this.promotionContent.onResize( isPortrait );

        let innerWidth = window.innerWidth;
        let innerHeight = window.innerHeight;
        let wideScreenRatio = ( 16 / 9 );
        let ratio = 16 / 9;
        if ( isPortrait ) {
            if ( innerWidth < ( VIEW_CONFIG.WIDTH * ( innerHeight / VIEW_CONFIG.CANVAS_HEIGHT ) ) ) {
                ratio = innerWidth / VIEW_CONFIG.WIDTH;
            } else {
                ratio = innerHeight / VIEW_CONFIG.CANVAS_HEIGHT;
            }
        } else {
            if ( innerWidth > innerHeight * wideScreenRatio ) {
                ratio = innerHeight / ( VIEW_CONFIG.UI_MIN_WIDTH / wideScreenRatio );
            } else {
                ratio = innerWidth / VIEW_CONFIG.UI_MIN_WIDTH;
            }
        }
        this.inGameMenuContent.setRatio( ratio );
        this.promotionContent.setRatio( ratio );
    }
    /***
    * implements IOrientable
    */
    onOrientationChange ( orientation: igmOrientation ): void {
        if ( orientation === igmOrientation.LADNSCAPE ) {
            this.landscapeLayout();
        }
        else {
            this.portraitLayout();
        }
    }
    landscapeLayout (): void {
        let position: Vec3 = this.config.floatingBoardCurrent.get( igmOrientation.LADNSCAPE );
        this.floatingBoardCurrent.node.setPosition( position );
        position = this.config.buttonInGameMenu.get( igmOrientation.LADNSCAPE );
        this.buttonInGameMenu.buttonCurrent.node.setPosition( position );

        this.floatingBoardCurrent.resetPosition();
        this.buttonInGameMenu.resetToggle();
        this.jackpotHint.resetPosition();
        this.promotionHint.resetPosition();
        if ( InGameInformation.instance.inGameMenuConfig.isAvailable === true ) {
            this.inGameMenuContent.init();
            this.inGameMenuContent.onResize( true );
        }
    }
    portraitLayout (): void {
        let position: Vec3 = this.config.floatingBoardCurrent.get( igmOrientation.PORTRAIT );
        this.floatingBoardCurrent.node.setPosition( position );
        position = this.config.buttonInGameMenu.get( igmOrientation.PORTRAIT );
        this.buttonInGameMenu.buttonCurrent.node.setPosition( position );

        this.floatingBoardCurrent.resetPosition();
        this.buttonInGameMenu.resetToggle();
        this.jackpotHint.resetPosition();
        this.promotionHint.resetPosition();
        if ( InGameInformation.instance.inGameMenuConfig.isAvailable === true ) {
            this.inGameMenuContent.init();
            this.inGameMenuContent.onResize( false );
        }
    }

    addListeners (): void {
        // * Add onResize listener
        window.addEventListener( 'resize', () => { this.onResize(); } );

        EventManager.instance.addListener( this, EventTypes.GAME_UPDATE_TOTAL_BET, this.updateTotalBet.bind( this ) );
    }
    /** 浮動按鈕右 熱門遊戲＋最愛遊戲 */
    public onButtonInGameMenuClick (): void {
        this.getInGameMenuData();
    }
    /** 浮動按鈕左下 撒幣＋晉升賽＋錦標賽 */
    public onButtonPromotionClick (): void {
        if ( this.isDoneBadgePromotion === false ) {
            this.isDoneBadgePromotion = true;
            this.nodeBadgePromotion.active = false;
        }
        this.promotionContent.setSlideToIndex( this.visiblePromotion );
        this.promotionContent.sendPromoteApi( Date.now() );

        this.playSound();
        //this.promotionHint.popOutHint( 'titleX', 'Xmessage', undefined );//測試promotionHint
    }
    /** 浮動按鈕左上 Jackpot */
    public onButtonJackpotClick (): void {
        if ( this.isDoneBadgeJackpot === false ) {
            this.isDoneBadgeJackpot = true;
            this.nodeBadgeJackpot.active = false;
        }
        this.promotionContent.sendJackpotRefreshApi( Date.now() );

        this.playSound();
    }

    //XMLHttpRequest
    public initHttpRequest (): void {
        this.xhr = new XMLHttpRequest();
        this.xhr.timeout = 4 * 60 * 1000;
        this.xhr.ontimeout = function ( e ) {
            console.log( 'ERROR_INTERNET~~~' );
        };
        this.xhr.onerror = function () {
            console.log( 'ERROR_INTERNET~~~' );
        };
        this.xhr.onreadystatechange = this.stateChange.bind( this );
    }

    public stateChange (): void {
        if ( this.xhr.readyState === 4 && this.xhr.status === 200 ) {
            this.processResponse();
        }
    }

    public processResponse (): void {
        let response = this.xhr.response;
        if ( response == null ) {
            return;
        }
        let command = response.command;
        if ( response.error_code !== 0 ) {
            console.log( 'error_code command=' + command + ",cdde=" + response.error_code + ",msg=" + response.message + '~~~' );
            return;
        }

        switch ( command ) {
            case GET_IN_GAME_MENU:
                if ( response.data && response.data.length > 0 ) {
                    this.processInGameMenuData( response.data[ 0 ] );
                    this.inGameMenuContent.init();
                    this.inGameMenuContent.onResize( this.isPortrait() );
                }
                break;
            case UPDATE_IN_GAME_MENU_FAVORITE_GAME:
                this.closeInGameMenuContent();
                break;
            case GET_IN_GAME_MENU_GAME_URL:
                if ( response.data && response.data.length > 0 ) {
                    let gameURL = response.data[ 0 ][ 'url' ];
                    this.redirectToNewGame( gameURL );
                }
                break;
            case GET_CASH_DROP:
                let cashDropResponse = response.data;
                for ( let i = 0; i < cashDropResponse.length; i++ ) {
                    for ( let j = 0; j < InGameInformation.instance.promotionInformation.length; j++ ) {
                        if ( cashDropResponse[ i ].promotion_id === InGameInformation.instance.promotionInformation[ j ].promotion_id ) {
                            InGameInformation.instance.promotionInformation[ j ].mode = cashDropResponse[ i ].mode;
                            InGameInformation.instance.promotionInformation[ j ].mode_rule = cashDropResponse[ i ].mode_rule;
                            InGameInformation.instance.promotionInformation[ j ].promotion_content = cashDropResponse[ i ].promotion_content;
                        }
                    }
                }
                this.sendGetTournament();
                break;

            case GET_TOURNAMENT:
                let tournamentResponse = response.data;
                for ( let i = 0; i < tournamentResponse.length; i++ ) {
                    for ( let j = 0; j < InGameInformation.instance.promotionInformation.length; j++ ) {
                        if ( tournamentResponse[ i ].promotion_id === InGameInformation.instance.promotionInformation[ j ].promotion_id ) {
                            InGameInformation.instance.promotionInformation[ j ].mode = -1; //錦標賽給特定模式-1
                            InGameInformation.instance.promotionInformation[ j ].bonus_setting = tournamentResponse[ i ].bonus_setting;
                            InGameInformation.instance.promotionInformation[ j ].promotion_content = tournamentResponse[ i ].promotion_content;
                            InGameInformation.instance.promotionInformation[ j ].payout_status = tournamentResponse[ i ].payout_status;
                        }
                    }
                }
                this.sendGetCashDropPrizeRecord();
                this.promotionContent.createAllPage( false );
                break;

            case GET_CASH_DROP_PRIZE_RECORD:
                let cashDropPrizeRecordResponse = response.data;
                // 進行排序的程式碼
                if ( Array.isArray( cashDropPrizeRecordResponse ) ) {
                    cashDropPrizeRecordResponse.sort( function ( a, b ) {
                        return a.promotion_id > b.promotion_id ? 1 : -1;
                    } )
                }
                for ( let i = 0; i < cashDropPrizeRecordResponse.length; i++ ) {
                    for ( let j = 0; j < InGameInformation.instance.promotionInformation.length; j++ ) {
                        if ( cashDropPrizeRecordResponse[ i ].promotion_id === InGameInformation.instance.promotionInformation[ j ].promotion_id ) {
                            InGameInformation.instance.promotionInformation[ j ].user = cashDropPrizeRecordResponse[ i ].user;
                            // 進行排序的程式碼
                            if ( Array.isArray( InGameInformation.instance.promotionInformation[ j ].user ) ) {
                                InGameInformation.instance.promotionInformation[ j ].user.sort( ( a, b ) => {
                                    return b.date > a.date ? 1 : -1;
                                } )
                            }
                            InGameInformation.instance.promotionInformation[ j ].winner = cashDropPrizeRecordResponse[ i ].winner;
                        }
                    }
                }
                this.sendGetTournamentPrizeRecord();
                break;

            case GET_TOURNAMENT_PRIZE_RECORD:
                let tournamentPrizeRecordResponse = response.data;
                // 進行排序的程式碼
                if ( Array.isArray( tournamentPrizeRecordResponse ) ) {
                    tournamentPrizeRecordResponse.sort( function ( a, b ) {
                        return a.promotion_id > b.promotion_id ? 1 : -1;
                    } );
                }
                if ( response.data == null ) {
                    break;
                }
                for ( let i = 0; i < tournamentPrizeRecordResponse.length; i++ ) {
                    for ( let j = 0; j < InGameInformation.instance.promotionInformation.length; j++ ) {
                        if ( tournamentPrizeRecordResponse[ i ].promotion_id === InGameInformation.instance.promotionInformation[ j ].promotion_id ) {
                            InGameInformation.instance.promotionInformation[ j ].user = tournamentPrizeRecordResponse[ i ].user;
                            InGameInformation.instance.promotionInformation[ j ].winner = tournamentPrizeRecordResponse[ i ].winner;
                        }
                    }
                }
                this.promotionContent.updatePromoteWinner();
                break;

            case GET_JP:
                if ( response.data && response.data.length > 0 ) {
                    let responseData = response.data[ 0 ];
                    InGameInformation.instance.jackpotTierData[ 'content' ] = responseData.promotion_content;
                }
                this.sendGetJpPrizeRecord();
                this.promotionContent.createAllPage( true );
                break;

            case GET_JP_PRIZE_RECORD:
                let responseData = response.data;
                for ( let i = 0; i < responseData.length; i++ ) {
                    for ( let j = 0; j < InGameInformation.instance.jackpotInformation.length; j++ ) {
                        if ( responseData[ i ].promotion_id === InGameInformation.instance.jackpotInformation[ j ].promotion_id ) {
                            InGameInformation.instance.jackpotInformation[ j ].user = responseData[ i ].user;
                            InGameInformation.instance.jackpotInformation[ j ].winner = responseData[ i ].winner;
                        }
                    }
                }
                this.sendGetJpAmount();
                this.promotionContent.updateJackpotWinner();
                break;

            case GET_JP_AMOUNT:
                if ( response.data && response.data.length > 0 ) {
                    let responseData = response.data[ 0 ];
                    let dataKeys = Object.keys( responseData );
                    for ( let i = 0; i < dataKeys.length; i++ ) {
                        InGameInformation.instance.jackpotTierData[ dataKeys[ i ] ] = responseData[ dataKeys[ i ] ];
                    }
                }
                this.promotionContent.updateJackpotTierInfotmation();
                break;
        }
    }

    processInGameMenuData ( response ) {
        // * Process Hot, New and All game list
        let menuGames = response[ 'game' ];
        for ( let i = 0; i < menuGames.length; i++ ) {
            if ( menuGames[ i ][ 1 ] == 1 ) {
                InGameInformation.instance.inGameMenuConfig.new.push( menuGames[ i ][ 0 ] );
            } else if ( menuGames[ i ][ 1 ] == 2 ) {
                InGameInformation.instance.inGameMenuConfig.hot.push( menuGames[ i ][ 0 ] );
            }
            InGameInformation.instance.inGameMenuConfig.gameList.push( menuGames[ i ][ 0 ] );
        }

        // * Process favorite game list
        let favGames = response[ 'favorite' ];
        for ( let i = 0; i < favGames.length; i++ ) {
            InGameInformation.instance.inGameMenuConfig.favList.push( favGames[ i ] );
        }

        // * Keeps imageURL
        InGameInformation.instance.inGameMenuConfig.imageURL = response[ 'image' ];

        // * Create game data
        let allGamesData = response[ 'game_name' ];
        for ( let i = 0; i < allGamesData.length; i++ ) {
            InGameInformation.instance.inGameListStore[ allGamesData[ i ].game_id ] = allGamesData[ i ].language;
        }

        //getInGameMenuStatus
        InGameInformation.instance.inGameMenuConfig.isAvailable = response[ 'status' ] === 1;
    }

    public sendRequest ( data: any ): void {
        this.xhr.open( 'POST', igmUrlParameters.serverUrl );
        this.xhr.responseType = 'json';
        this.xhr.send( data );
    }

    getRequestInfo ( request ) {
        return {
            method: 'POST',
            body: JSON.stringify( request )
        };
    }

    getInGameMenuData () {
        // * If we already have data, don't call the api
        if ( InGameInformation.instance.inGameMenuConfig.favList.length > 0 || InGameInformation.instance.inGameMenuConfig.gameList.length > 0 ) {
            this.inGameMenuContent.init();
            this.inGameMenuContent.onResize( this.isPortrait() );
        } else {
            let data = {
                command: GET_IN_GAME_MENU,
                token: igmUrlParameters.token,
                data: {}
            };
            this.sendRequest( JSON.stringify( data ) );
        }
    }

    async fetchPromotionBrief () {
        const GET_PROMOTION_BRIEF = 'get_promotion_brief';
        let promotionBrief = {
            command: GET_PROMOTION_BRIEF,
            token: igmUrlParameters.token,
            data: {
                promotion_id: '-1',
            }
        };

        return fetch( igmUrlParameters.serverUrl, this.getRequestInfo( promotionBrief ) )
            .then( response => response.json() )
            .then( json => json.data );
    }

    async fetchInGameMenuStatus () {
        const GET_IN_GAME_MENU_STATUS = 'get_in_game_menu_status';
        let getIGMData = {
            command: GET_IN_GAME_MENU_STATUS,
            token: igmUrlParameters.token,
            data: {}
        };

        return fetch( igmUrlParameters.serverUrl, this.getRequestInfo( getIGMData ) )
            .then( response => response.json() )
            .then( json => json.data );
    }

    processPromotionBriefResponse ( response ) {
        let promotionBriefResponse = response;
        // 進行排序的程式碼
        if ( Array.isArray( promotionBriefResponse ) ) {
            promotionBriefResponse.sort( ( a, b ) => {
                const timeZoneNow: Date = new Date( new Date().toLocaleString( 'sv-SE', { timeZone: a.time_zone } ).replace( /-/g, '/' ) );
                const timeA = new Date( a.end_date.replace( /-/g, '/' ) ).getTime() - timeZoneNow.getTime();
                const timeB = new Date( b.end_date.replace( /-/g, '/' ) ).getTime() - timeZoneNow.getTime();
                return timeB > timeA ? 1 : -1;
            } );
        }

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
                InGameInformation.instance.jackpotInformation.push( {
                    promotion_id: promotionBriefResponse[ i ].promotion_id,
                    end_date: promotionBriefResponse[ i ].end_date,
                    promotion_name: promotionBriefResponse[ i ].promotion_name,
                    time_zone: promotionBriefResponse[ i ].time_zone,
                    min_bet: promotionBriefResponse[ i ].min_bet,
                    currency: promotionBriefResponse[ i ].currency,
                    promotion_type: promotionBriefResponse[ i ].promotion_type,
                } );
            } else {
                InGameInformation.instance.promotionInformation.push( {
                    promotion_id: promotionBriefResponse[ i ].promotion_id,
                    end_date: promotionBriefResponse[ i ].end_date,
                    promotion_name: promotionBriefResponse[ i ].promotion_name,
                    time_zone: promotionBriefResponse[ i ].time_zone,
                    min_bet: promotionBriefResponse[ i ].min_bet,
                    currency: promotionBriefResponse[ i ].currency,
                    promotion_type: promotionBriefResponse[ i ].promotion_type,
                } );
            }
        }
    }

    scheduleFetchExtraData () {
        this.scheduleId = setInterval( async () => {
            let extraResponse = await this.fetchExtraData();
            this.processExtraData( extraResponse );
        }, ( 60 * 1000 ) );
    }

    async fetchExtraData () {
        const GET_EXTRA_DATA = 'get_extra_data';
        let extraData = {
            command: GET_EXTRA_DATA,
            token: igmUrlParameters.token,
            data: {
                interval: 60,
            }
        };

        return fetch( igmUrlParameters.serverUrl, this.getRequestInfo( extraData ) )
            .then( response => response.json() );
    }

    processExtraData ( response ) {
        if ( response.error_code ) {
            console.log( 'command=' + response.command + ',code=' + response.error_code + ',msg=' + response.message + '~~~' );
            return;
        }

        if ( !( InGameInformation.instance.promotionInformation.length > 0 || InGameInformation.instance.jackpotInformation.length > 0 ) ) {
            // * There is no promotion, so clear it
            clearInterval( this.scheduleId );
        }

        let extraResponse = response.data;
        for ( let i = 0; i < extraResponse.length; i++ ) {
            let extraData = extraResponse[ i ];
            // * For cash drop
            if ( extraData.cash_drop !== null ) {
                for ( let j = 0; j < InGameInformation.instance.promotionInformation.length; j++ ) {
                    if ( InGameInformation.instance.promotionInformation[ j ].promotion_id === extraData.cash_drop.promotion_id ) {
                        this.showUpPromotionNotification( j, extraData.cash_drop );
                    }
                }
            }

            // * For jackpot
            if ( extraData.jackpot ) {
                for ( let j = 0; j < InGameInformation.instance.jackpotInformation.length; j++ ) {
                    this.showUpJackpotNotification( j, extraData.jackpot );
                }
            }
        }
    }

    getGameUrl ( gameId ) {
        let data = {
            command: GET_IN_GAME_MENU_GAME_URL,
            token: igmUrlParameters.token,
            data: {
                game_id: gameId,
                lang: igmUrlParameters.language,
                b: igmUrlParameters.b
            }
        };
        this.sendRequest( JSON.stringify( data ) );
    }

    updateFavoriteList () {
        let data = {
            command: UPDATE_IN_GAME_MENU_FAVORITE_GAME,
            token: igmUrlParameters.token,
            data: {
                favorite: InGameInformation.instance.inGameMenuConfig.favList,
            }
        };
        this.sendRequest( JSON.stringify( data ) );
    }

    sendGetJp () {
        let getJpData = {
            command: GET_JP,
            token: igmUrlParameters.token,
            data: {}
        };
        this.sendRequest( JSON.stringify( getJpData ) );
    }

    sendGetJpPrizeRecord () {
        let getJpPrizeRecordData = {
            command: GET_JP_PRIZE_RECORD,
            token: igmUrlParameters.token,
            data: {}
        };
        this.sendRequest( JSON.stringify( getJpPrizeRecordData ) );
    }

    sendGetJpAmount () {
        let getJpAmountData = {
            command: GET_JP_AMOUNT,
            token: igmUrlParameters.token,
            data: {}
        };
        this.sendRequest( JSON.stringify( getJpAmountData ) );
    }

    sendGetCashDrop () {
        let getCashDropData = {
            command: GET_CASH_DROP,
            token: igmUrlParameters.token,
            data: {
                promotion_id: '-1'
            }
        };
        this.sendRequest( JSON.stringify( getCashDropData ) );
    }

    sendGetTournament () {
        let getTournamentData = {
            command: GET_TOURNAMENT,
            token: igmUrlParameters.token,
            data: {
                promotion_id: '-1'
            }
        };
        this.sendRequest( JSON.stringify( getTournamentData ) );
    }

    sendGetCashDropPrizeRecord () {
        let getCashDropPrizeRecordData = {
            command: GET_CASH_DROP_PRIZE_RECORD,
            token: igmUrlParameters.token,
            data: {
                promotion_id: '-1'
            }
        };
        this.sendRequest( JSON.stringify( getCashDropPrizeRecordData ) );
    }

    sendGetTournamentPrizeRecord () {
        let getTournamentPrizeRecordData = {
            command: GET_TOURNAMENT_PRIZE_RECORD,
            token: igmUrlParameters.token,
            data: {
                promotion_id: '-1'
            }
        };
        this.sendRequest( JSON.stringify( getTournamentPrizeRecordData ) );
    }


    async afterGameReadyToSpin () {
        //this.mainUIContainer = event.detail.container;
        //this.userAccount = event.detail.account;

        let promotionResponse = await this.fetchPromotionBrief();
        this.processPromotionBriefResponse( promotionResponse );

        let igmStatusResponse = await this.fetchInGameMenuStatus();
        this.inGameMenuStatus = igmStatusResponse[ 0 ].status as number;

        this.createIcon();
    }

    createIcon () {
        //this.promotion = new Promotion(this.mainUIContainer, this.promotionInformation, this.jackpotInformation);
        this.promotionInit();

        this.onResize();
    }

    promotionInit () {
        this.createJackpotItem();

        this.createPromotionItem();

        //顯示按鈕數的背景
        let buttonCount: number = 0;
        if ( InGameInformation.instance.promotionInformation.length > 0 ) {
            buttonCount++;
        }
        if ( InGameInformation.instance.jackpotInformation.length > 0 ) {
            buttonCount++;
        }
        if ( buttonCount === 0 ) {
            let uiOpacity: UIOpacity = this.node.getComponent<UIOpacity>( UIOpacity );
            uiOpacity.opacity = 0;
        }
        else {
            let index: number = buttonCount - 1;//array index from 0 to (count-1)
            this.spriteBackgroundFloatingBoard[ index ].node.active = true;
            this.floatingBoardCurrent.setTweenDistance( this.tweenDistanceFloatingBoard[ index ] );
        }

        this.loadSettings();
    }

    public createPromotionItem (): void {
        if ( InGameInformation.instance.promotionInformation.length <= 0 ) {
            this.buttonPromotion.node.active = false;
            return;
        }
        else {
            this.buttonPromotion.node.active = true;
        }

        // promotionHint
        this.promotionHint.init( 0 );

        // 搜第一個活動
        let i: number = this.visiblePromotion;
        // 剩餘時間
        let timeleft: number = this.getReciprocalTimeExpand( i );
        let isFinish: boolean = ( timeleft === 0 );

        // 換圖
        this.changePromotionButtonSprite( i, isFinish );

        //更新
        if ( InGameInformation.instance.promotionInformation.length <= 0 ) {
            return;//0->沒活動
        }
        // 每60秒撈一次活動剩餘時間
        setInterval( () => {
            this.getReciprocalTimeExpand( this.visiblePromotion );
        }, 60000 );

        // 這次跑出來的結果跟上次一樣就表示只有一個或是沒有活動
        if ( ( InGameInformation.instance.promotionInformation.length <= 1 ) ) {
            return;//0->沒活動 , 1->只有一個活動
        }
        // 每5秒輪播活動按鈕
        setInterval( () => {
            this.visiblePromotion++;
            if ( this.visiblePromotion >= InGameInformation.instance.promotionInformation.length ) {
                this.visiblePromotion = 0;
            }

            let isFinish: boolean = ( this.reciprocalTime[ this.visiblePromotion ] === '' );
            this.changePromotionButtonSprite( this.visiblePromotion, isFinish );
        }, 5000 );
    }

    public changePromotionButtonSprite ( target: number, isFinish: boolean ): void {
        let sprite: Sprite = this.spriteBackgroundPromotion;
        let i: number = target;

        // * promotion_type => 0: cash drop, 1: tournament, 2: jackpot
        let isCashDrop: boolean = ( InGameInformation.instance.promotionInformation[ i ].promotion_type === 0 );

        let length: number = 1;
        if ( isCashDrop === true ) {
            if ( isFinish === true ) {
                length = this.spriteFrameCashDropFinish.length;
            }
            else {
                length = this.spriteFrameCashDrop.length;
            }
        }
        else {
            if ( isFinish === true ) {
                length = this.spriteFrameTournamentFinish.length;
            }
            else {
                length = this.spriteFrameTournament.length;
            }
        }
        if ( length === 0 ) length = 1;//divided by zero check
        let index: number = i % length;
        // promotion button texture
        if ( isCashDrop === true ) {
            if ( isFinish === true ) {
                sprite.spriteFrame = this.spriteFrameCashDropFinish[ index ];
            }
            else {
                sprite.spriteFrame = this.spriteFrameCashDrop[ index ];
            }
        }
        else {
            if ( isFinish === true ) {
                sprite.spriteFrame = this.spriteFrameTournamentFinish[ index ];
            }
            else {
                sprite.spriteFrame = this.spriteFrameTournament[ index ];
            }
        }

        // 只剩結束的活動
        let uiOpacity: UIOpacity = this.buttonPromotion.getComponent<UIOpacity>( UIOpacity );
        if ( isFinish ) {
            //this.promotionButtons[0].setAlpha(0.6);
            uiOpacity.opacity = 153;
        }
        else {
            //this.promotionButtons[i].setAlpha(1);
            uiOpacity.opacity = 255;
        }

        //剩餘時間
        this.labelTimeLeft.string = this.reciprocalTime[ i ];

        // promotion icon fx
        let promotionFxName = 'CrazyCashDrop_fx';
        // * promotion_type => 0: cash drop, 1: tournament, 2: jackpot
        let animation: string = 'play';
        if ( isCashDrop ) {
            if ( this.spineAnimationCashDrop.node.active === false ) {
                this.spineAnimationCashDrop.node.active = true;
                this.spineAnimationCashDrop.playAnimation( 0, animation, true );
            }
            this.spineAnimationTournament.node.active = false;
        } else {
            if ( this.spineAnimationTournament.node.active === false ) {
                this.spineAnimationTournament.node.active = true;
                this.spineAnimationTournament.playAnimation( 0, animation, true );
            }
            this.spineAnimationCashDrop.node.active = false;
        }
    }

    public createJackpotItem (): void {
        if ( InGameInformation.instance.jackpotInformation.length <= 0 ) {
            this.buttonJackpot.node.active = false;
            if ( InGameInformation.instance.promotionInformation.length > 0 ) {
                let position: Vec3 = this.buttonJackpot.node.getPosition();
                this.buttonPromotion.node.setPosition( position );
            }
            return;
        }
        else {
            this.buttonJackpot.node.active = true;
        }

        //PromotionHint 
        let iconPosition: Vec3 = this.config.JackpotHintSpriteIcon.get( igmViewport.instance.getCurrentOrientation() );
        this.jackpotHint.init( iconPosition.x );

        // * Jackpot icon fx
        let animation: string = 'play_0';
        this.spineAnimationJackpot.playAnimation( 0, animation, true );
    }

    loadSettings () {
        let storage = window.localStorage;
        let jpData = storage.getItem( LOCALSTORAGE_JACKPOT_KEY );
        if ( jpData !== null ) {
            InGameInformation.instance.jackpot_notifications = JSON.parse( jpData );
        } else {
            storage.setItem( LOCALSTORAGE_JACKPOT_KEY, JSON.stringify( InGameInformation.instance.jackpot_notifications ) );
        }
    }

    showUpPromotionNotification ( index, data ) {
        let title = InGameInformation.instance.promotionInformation[ index ].promotion_name;
        let currency = InGameInformation.instance.promotionInformation[ index ].currency;
        let prize = this.toFixedNoRound( data.prize_credit, 0 );
        let message = `Congratulation, You Won ${ currency } ${ prize }`;
        message = InGameMenuDisplayLanguage.instance.getPromotionNotification( currency, prize );

        this.promotionHint.popOutHint( title, message, undefined );
    }

    showUpJackpotNotification ( index, data ) {
        let isYou = data.account === InGameInformation.instance.userAccount;
        let wonAmount = this.toFixedNoRound( data.prize_credit, 0 );
        let jpTier = data.prize_type;
        let stride = '                  ';
        let playerName = isYou ? 'You' : data.account;

        if ( InGameInformation.instance.jackpot_notifications.notification ) {
            let checkKeyName = '';
            switch ( jpTier ) {
                case 'grand':
                    checkKeyName = ( isYou ) ? 'myGrand' : 'otherGrand';
                    break;
                case 'major':
                    checkKeyName = ( isYou ) ? 'myMajor' : 'otherMajor';
                    break;
                case 'minor':
                    checkKeyName = ( isYou ) ? 'myMinor' : 'otherMinor';
                    break;
                case 'mini':
                    checkKeyName = ( isYou ) ? 'myMini' : 'otherMini';
                    break;
            }

            if ( InGameInformation.instance.jackpot_notifications.settings[ checkKeyName ] ) {
                let currency = InGameInformation.instance.jackpotInformation[ index ].currency;
                let displayText = `${ playerName } Won${ stride }${ currency }${ wonAmount }!!`;
                displayText = InGameMenuDisplayLanguage.instance.getJackpotNotification( playerName, currency, wonAmount, isYou );

                this.jackpotHint.jackpotPopUpSetting( isYou );
                this.jackpotHint.popOutHint( InGameInformation.instance.jackpotInformation[ index ].promotion_name, displayText, jpTier );
            }
        }
    }

    updateTotalBet ( totalBet: number ) {
        for ( let i = 0; i < InGameInformation.instance.promotionInformation.length; i++ ) {
            let isRequireMinBet = ( InGameInformation.instance.promotionInformation[ i ].min_bet !== 0 );
            if ( isRequireMinBet && totalBet < InGameInformation.instance.promotionInformation[ i ].min_bet ) {
                let title = InGameInformation.instance.promotionInformation[ i ].promotion_name;
                let minBet = `${ InGameInformation.instance.promotionInformation[ i ].currency } ${ this.toFixedNoRound( InGameInformation.instance.promotionInformation[ i ].min_bet, 0 ) }`;
                let message = `Qualifying promo bet amount must be higher than ${ minBet }`;
                message = InGameMenuDisplayLanguage.instance.getTotalBetMessage( minBet );

                this.promotionHint.popOutHint( title, message, '' );
            }
        }
    }
    /**
     * 取得剩餘時間,回傳number (原本為回傳array)
     * @param target 
     * @returns number
     */
    public getReciprocalTimeExpand ( target: number ): number {
        let timeLeft: number = 0;
        for ( let i = 0; i < InGameInformation.instance.promotionInformation.length; i++ ) {
            //換算時區時間差異
            let timeDifference = new Date( InGameInformation.instance.promotionInformation[ i ].end_date.replace( /-/g, '/' ) ).getTime() - new Date( new Date().toLocaleString( 'sv-SE', { timeZone: InGameInformation.instance.promotionInformation[ i ].time_zone } ).replace( /-/g, '/' ) ).getTime();
            let date = Math.floor( timeDifference / 1000 / 86400 );
            let hour = Math.floor( timeDifference / 1000 % 86400 / 3600 );
            let minute = Math.floor( timeDifference / 1000 % 86400 % 3600 / 60 );
            let second = Math.floor( timeDifference / 1000 % 86400 % 3600 % 60 );

            if ( timeDifference < 0 ) {
                this.reciprocalTime[ i ] = '';
            } else {
                if ( date === 0 ) {
                    this.reciprocalTime[ i ] = hour + 'h ' + minute + 'm ';
                } else {
                    this.reciprocalTime[ i ] = date + 'd ' + hour + 'h ';
                }
            }

            if ( target === i ) {
                if ( timeDifference < 0 ) {
                    timeLeft = 0;
                }
                else {
                    timeLeft = timeDifference;
                }
            }
        }
        return timeLeft;
    }

    closeInGameMenuContent () {
        this.inGameMenuContent.closeWindowAndSave();
    }

    public redirectToNewGame ( url ): void {
        window.location.assign( url );
    }

    public isPortrait (): boolean {
        return ( igmViewport.instance.getCurrentOrientation() === igmOrientation.PORTRAIT );
    }

    public toFixedNoRound ( value: number | string, fixed: number ): string {
        return igmUtils.toFixedNoRound( value, fixed );
    }

    /**
     * 播放按鍵音效
     */
    public playSound ( volume: number = 1.0, loop: boolean = false ): void {
        if ( !this.audioSource ) {
            return;
        }
        this.audioSource.loop = loop;
        if ( this.soundMuted ) {
            this.audioSource.volume = 0;
        } else {
            this.audioSource.volume = volume;
        }
        this.audioSource.play();
    }
    /**
     * 靜音
     * toDo ..
     */
    public setSoundMuted ( set: boolean ) {
        this.soundMuted = set;
    }
}

