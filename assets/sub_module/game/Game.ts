import { _decorator, Component, JsonAsset, screen } from 'cc';
import { SlotEvents, StateManager } from './StateManager';
import { gameInformation } from './GameInformation';
import { HttpConstants, HttpRequest } from '../network/HttpRequest';
import { comparer } from 'mobx';
import { DataManager } from '../data/DataManager';
import { Utils } from '../utils/Utils';
const { ccclass, property } = _decorator;

@ccclass( 'Game' )
export class Game extends Component {

    //@property({type:JsonAsset, displayName:'Config.json'})
    //public configJson:JsonAsset;

    public static Instance: Game;

    protected onLoad(): void { 
        Game.Instance = this; 
        Utils.getConfig();
        //Game.setConfig(this.configJson.json);
        //console.log(Config);
    }

    start () {
        // console.log('http://localhost:7456/?gameid=4100&token=testtoken4100&betrecordurl=http://br-lab.game-rock.online&lang=en&homeurl=https://localhost&mode=0&serverurl=http://gs-lab.game-rock.online&t=20230823&b=iqazwsxi');
        StateManager.instance.slotService.start();
        const self = this;
        /*this.getPromotionBrief()
            .then( this.getInGameMenuStatus )
            .then( this.getInGameMenuData )
            .catch( function () {
                console.log( 'fail to fetch the brief of promotion or the status of in game menu from server' );
        } );*/
    }

    get isFullScreen() { return screen.fullScreen(); }

    fullscreen(act:boolean) {
        if ( act === true ) screen.requestFullScreen();
        else screen.exitFullScreen();
    }

    async getPromotionBrief () {
        let getPromotionBrief = {
            "command": HttpConstants.GET_PROMOTION_BRIEF,
            "token": gameInformation.token,
            "data": {
                promotion_id: '-1'
            }
        };
        let result = await HttpRequest.establishConnect( JSON.stringify( getPromotionBrief ) );
    }

    async getInGameMenuStatus () {
        let getInGameMenuStatus = {
            'command': HttpConstants.GET_IN_GAME_MENU_STATUS,
            'token': gameInformation.token,
            'data': {}
        };
        let result = await HttpRequest.establishConnect( JSON.stringify( getInGameMenuStatus ) );
    };

    async getInGameMenuData () {
        if ( gameInformation.inGameMenuStore.isAvailable ) {
            let getInGameMenuData = {
                'command': HttpConstants.GET_IN_GAME_MENU,
                'token': gameInformation.token,
                'data': {}
            };
            let result = await HttpRequest.establishConnect( JSON.stringify( getInGameMenuData ) );
        }
    };
}