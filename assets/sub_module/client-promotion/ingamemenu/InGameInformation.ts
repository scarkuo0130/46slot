import { _decorator } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 類別,將inGameMenu裡,server傳來的資料存放在這
 */
@ccclass( 'InGameInformation' )
export class InGameInformation {
    private static _instance: InGameInformation;
    /** server data InGameMenu */
    public inGameMenuConfig = {
        imageURL: '',
        isAvailable: false,
        hot: [],
        new: [],
        gameList: [],
        favList: [],
    };
    public inGameListStore = {};

    /** server data Promotion */
    public promotionInformation = [];
    public jackpotInformation = [];
    public jackpotTierData = {
        mini: 0,
        minor: 0,
        major: 0,
        grand: 0,
        content: ''
    };
    public userAccount: any;
    /** jackpot設定 */
    public jackpot_notifications = {
        notification: true,
        settings: {
            myGrand: true,
            myMajor: true,
            myMinor: false,
            myMini: false,
            otherGrand: true,
            otherMajor: true,
            otherMinor: false,
            otherMini: false,
        }
    };

    public static get instance () {
        if ( this._instance ) {
            return this._instance;
        }

        this._instance = new InGameInformation();
        return this._instance;
    }
}

