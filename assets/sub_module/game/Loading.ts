import { _decorator, Color, Component, director, Sprite, SpriteFrame, tween } from 'cc';
import { HttpConstants, HttpRequest } from '../network/HttpRequest';
import { gameInformation } from './GameInformation';
import { EventType } from '../game/Constants';
import { EventManager } from '../events/EventManager';
import { Utils, _utilsDecorator } from '../utils/Utils';
import { i18n } from '../utils/i18n';
import { PREVIEW } from 'cc/env';
import { GoogleAnalytics } from '../analytics/GoogleAnalytics';
import { LoadingUI } from '../../4500/scripts/LoadingUI';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;


@ccclass( 'LoadingImage' )
export class LoadingImage {
    @property( { displayName: 'platformID', tooltip: '平台ID' } )
    public platformID: string = "";

    @property( { displayName: 'platformName', tooltip: '平台名稱' } )
    public platformName: string = "";

    @property( { type: SpriteFrame, displayName: 'HorizontalImage', tooltip: '水平圖片' } )
    public horizontalImage: SpriteFrame;

    @property( { type: SpriteFrame, displayName: 'VerticalImage', tooltip: '垂直圖片' } )
    public verticalImage: SpriteFrame;
}

@ccclass( 'Loading' )
@disallowMultiple( true )
@menu( 'SlotMachine/Loading' )
@help( 'https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.uq1iuogho2k7' )
export class Loading extends Component {

    @property( { displayName: 'LoadingScene', tooltip: 'Input game scene', group: { name: 'Setting', id: '0' } } )
    public GameScene: string = "Game";

    //@property( { type: ProgressBar, displayName: 'ProgressBar', tooltip: 'Loading進度條', group: { name: 'Setting', id: '0' } } )
    //public progressBar !: ProgressBar;
    //@property( { type: Label, displayName: 'ProgressLabel', tooltip: '顯示進度數字', group: { name: 'Setting', id: '0' } } )
    //public progressLabel: Label;

    //gameid=4100&token=testtoken4100&betrecordurl=http://br-lab.game-rock.online&lang=en&homeurl=https://localhost&mode=0&serverurl=http://gs-lab.game-rock.online&t=20231101&b=iqazwsxi
    @property( { displayName: "GameID", tooltip: "遊戲ID", group: { name: 'Preview', id: '0' } } )
    public gameid: number = 0;

    @property( { displayName: "token", tooltip: "testtoken+gameID", group: { name: 'Preview', id: '0' } } )
    public token: string = "";

    @property( { displayName: "serverurl", tooltip: "serverurl", group: { name: 'Preview', id: '0' } } )
    public serverurl: string = "http://gs-lab.game-rock.online";

    @property( { displayName: 'lang', tooltip: '語系en', group: { name: 'Preview', id: '0' } } )
    public lang: string = "en";

    @property( { displayName: 'betrecordurl', group: { name: 'Preview', id: '0' } } )
    public betrecordurl: string = "http://br-lab.game-rock.online";


    @property( { type: [ LoadingImage ], displayName: 'PlatformImage', tooltip: '載入平台圖片', group: { name: 'LoadingPlatfromImage', id: '0' } } )
    public platformImage: LoadingImage[] = [];

    @property( { type: Sprite, displayName: 'HorizontalSprite', tooltip: '橫版圖片顯示', group: { name: 'LoadingPlatfromImage', id: '0' } } )
    public horizontalSprite: Sprite = null;

    @property( { type: Sprite, displayName: 'VerticalSprite', tooltip: '直版圖片顯示', group: { name: 'LoadingPlatfromImage', id: '0' } } )
    public verticalSprite: Sprite = null;

    @property( { type: Sprite, displayName: 'MaskSprite', tooltip: '遮罩圖片顯示', group: { name: 'LoadingPlatfromImage', id: '0' } } )
    public maskSprite: Sprite = null;

    public static Instance: Loading;

    onLoad () {
        Loading.Instance = this;
        Utils.getConfig();
        this.getParamURL();
        this.changePlatformImage();
    }

    start () {
        const self = this;
        //this.tweenPlatfromImage();
        this.getRenewToken()
            .then( this.getUserData )
            .then( this.getGameData )
            .then( this.loadGameScene )
            .catch( function ( e ) {
                console.error( e );
                console.error( 'fail to load data from server' );
                cc.Dailog.errorMessage( e );
            } );
    }

    /**
     * 更換平台商的 Loading 圖片
     */
    changePlatformImage () {
        if ( Loading.getUrlParams == null ) return;
        if ( Loading.getUrlParams[ 'b' ] == null ) return;

        this.horizontalSprite.node.active = true;
        this.verticalSprite.node.active = true;
        //this.maskSprite.node.active = true;

        let id = Loading.getUrlParams[ 'b' ];
        let index: number = 0;
        for ( let idx in this.platformImage ) {
            let platformData = this.platformImage[ idx ];
            if ( platformData.platformID != id ) {
                index++;
                continue;
            }
            this.horizontalSprite.spriteFrame = platformData.horizontalImage;
            this.verticalSprite.spriteFrame = platformData.verticalImage;
            index++;
        }
    }

    /**
     * 淡出平台商的 Loading 圖片
     */
    private async tweenPlatfromImage () {
        let alpha = { a: 255 };
        let self = this;
        tween( alpha ).to( 0.2, { a: 0 }, { onUpdate: ( a ) => { self.maskSprite.color = new Color( 0, 0, 0, alpha.a ); } } ).start();
        await Utils.delay( 1000 );

        alpha = { a: 255 };
        tween( alpha ).to( 0.5, { a: 0 }, {
            onUpdate: ( a ) => {
                if ( self.horizontalSprite ) {
                    self.horizontalSprite.color = new Color( 0, 0, 0, alpha.a );
                }
                if ( self.verticalSprite ) {
                    self.verticalSprite.color = new Color( 0, 0, 0, alpha.a );
                }
            }
        } ).start();

    }

    static getUrlParams: any = null;
    public getParamURL () {
        let paramURL = Utils.parseURLToJson();
        Loading.getUrlParams = paramURL;
        gameInformation.gameid = Number.parseInt( this.getParam( paramURL, 'gameid' ) );
        gameInformation.token = this.getParam( paramURL, 'token' );
        gameInformation._paramToken = this.getParam( paramURL, 'token' );
        gameInformation.serverurl = this.getParam( paramURL, 'serverurl' );
        gameInformation.lang = this.getParam( paramURL, 'lang' );
        gameInformation.betrecordurl = this.getParam( paramURL, 'betrecordurl' );
        i18n.init( gameInformation.lang );
    }

    public getParam ( param, key ) {
        if ( param != null ) return param[ key ];
        if ( Utils.isDevelopment() == true ) return this[ key ];
        return null;
    }

    async getRenewToken () {
        let paramToken = gameInformation._paramToken;
        let token = sessionStorage.getItem( paramToken );

        if ( token != null && token.length > 0 ) return token;
        let getRenewToken = {
            "command": HttpConstants.GET_RENEW_TOKEN,
            "token": gameInformation.token,
            "data": {}
        };

        let result = await HttpRequest.establishConnect( JSON.stringify( getRenewToken ) );
        console.log( 'getUserData', result );
    }

    async getUserData () {
        let getUserData = {
            "command": HttpConstants.GET_USER_DATA,
            "token": gameInformation.token,
            "data": {}
        };
        let result = await HttpRequest.establishConnect( JSON.stringify( getUserData ) );
        console.log( 'getUserData', result );
        EventManager.instance.dispatchEvent( EventType.UPDATE_PROGRESS, 0.2 );
    }

    async getGameData () {
        let getGameData = {
            "command": HttpConstants.GET_GAME_DATA,
            "token": gameInformation.token,
            "data": {
                game_id: gameInformation.gameid
            }
        };
        let result = await HttpRequest.establishConnect( JSON.stringify( getGameData ) );
        console.log( 'getGameData', result );
        EventManager.instance.dispatchEvent( EventType.UPDATE_PROGRESS, 0.4 );
    }

    async loadGameScene () {
        const self = this;
        GoogleAnalytics.instance.initialize();
        director.preloadScene( Loading.Instance.GameScene, function ( completedCount, totalCount, item ) {
            let rate = completedCount / totalCount;
            let progress = Math.floor( rate * 100 );
            if ( rate > 0.4 ) {
                EventManager.instance.dispatchEvent( EventType.UPDATE_PROGRESS, rate );
            }
        }, function () {
            EventManager.instance.dispatchEvent( EventType.UPDATE_PROGRESS, 1 );
            director.loadScene( Loading.Instance.GameScene );
        } );
    }
}

