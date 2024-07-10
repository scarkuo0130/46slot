import { SpinMode } from './Constants';
import { Config } from './GameConfig';

export const HIGH_PAY_SYMBOL_1 = 1 
export const HIGH_PAY_SYMBOL_2 = 2 
export const HIGH_PAY_SYMBOL_3 = 3 
export const HIGH_PAY_SYMBOL_4 = 4 
export const HIGH_PAY_SYMBOL_5 = 5
export const LOW_PAY_SYMBOL_1 = 6 
export const LOW_PAY_SYMBOL_2 = 7 
export const LOW_PAY_SYMBOL_3 = 8 
export const LOW_PAY_SYMBOL_4 = 9 
export const LOW_PAY_SYMBOL_5 = 10
export const SCATTER_ID = 11 ;
export const WILD_ID = 0 ;
export const WILD_2_ID = 120 ;//offset only
export const WILD_3_ID = 121 ;
export const WILD_4_ID = 122 ;
export const WILD_5_ID = 123 ;
export const WILD_10_ID = 124 ;

type CashDrop = {
    information: [],
    modeRandom: number,
    modeColumn: number,
    modeMultiplier: number,
    user: [],
    winner: [],
    updateTime: number
};
type PromotionUser = {
    account: string,
    bet_credit: number,
    prize_credit: number,
    multiplier: number,
    date: Date
}
type PromotionInformation = {
    promotion_type: number,
    promotion_id: string,
    promotion_name: string,
    promotion_content: string,
    min_bet: number,
    time_zone: string,
    end_date: Date,
    currency: string,
    mode: number,
    mode_rule: number[],
    bonus_setting: {
        bonus: number,
        start_rank: number,
        end_rank: number
    },
    payout_status: number,
    user: PromotionUser[],
    winner: PromotionUser[]
};
type Promotion = {
    information: PromotionInformation[],
    jackpotInformation: PromotionInformation[],
    modeRandom: number,
    modeColumn: number,
    modeMultiplier: number,
    modeTournament: number,
    user: PromotionUser[],
    winner: PromotionUser[],
    updateTime: number,
    jpInfo: {
        mini: number,
        minor: number,
        major: number,
        grand: number,
        content: string
    }
};
type InGameMenuStore = {
    imageURL: string,
    isAvailable: boolean,
    hot: number[],
    new: number[],
    gameList: number[],
    favList: number[]
};

export class GameInformation {
    _betrecordurl: string = '';
    _gameid: number = 0;
    _token: string = '';
    _paramToken: string = '';
    _serverurl: string = '';
    _windowSearch = new Map<string, string>();
    _currencySymbol: string = '';
    _currency: string = '';
    _winLevelRate = {
        WIN: 20,
        BIG_WIN: 40,
        SUPER_WIN: 60,
        MEGA_WIN: 80
    };
    _buyInformation = {
        allowBuy: 0,
        limitTotal: 100000000,
        multiplier: 1
    };
    _isDebugMode: boolean = false;
    _testCurrency: string = '';
    _spinMode: SpinMode = SpinMode.NONE;
    _urlLanguage: string = '';
    _lang: string = "en";
    /****** 遊戲資訊 ******/
    _coinValue: number = 0;
    // 後端回傳回來的所有coin value選項
    _coinValueArray: Array<number> = [];
    // 後端回傳回來預設的coin value
    _coinValueDefaultIndex: number = 0;
    _lineBet: number = 0;
    // 後端回傳回來的所有line bet選項
    _lineBetArray: Array<number> = [];
    // 後端回傳回來預設的line bet
    _lineBetDefaultIndex: number = 0;
    // 後端回傳回來的線數總數
    _lineTotal: number = 0;
    _totalBet: number = 0;
    //後端回傳的購買金額
    _betCredit: number = 0;
    _bet_available_idx : number = 0;
    public fixedDigit: number = 0;
    public coinValueArray = [ 0.1, 0.2, 0.5, 1, 2, 5, 10 ];
    public lineBetArray = [];

    cashDrop: CashDrop = {
        information: [],
        modeRandom: 0,
        modeColumn: 1,
        modeMultiplier: 2,
        user: [],
        winner: [],
        updateTime: 300000
    };
    promotion: Promotion = {
        information: [],
        jackpotInformation: [],
        modeRandom: 0,
        modeColumn: 1,
        modeMultiplier: 2,
        modeTournament: -1,
        user: [],
        winner: [],
        updateTime: 300000,
        jpInfo: {
            mini: 0,
            minor: 0,
            major: 0,
            grand: 0,
            content: ''
        }
    };
    inGameMenuStore: InGameMenuStore = {
        imageURL: '',
        isAvailable: false,
        hot: [],
        new: [],
        gameList: [],
        favList: []
    };
    gameListStore: {};

    public get betrecordurl () {
        return this._betrecordurl;
    }

    public set betrecordurl ( value: string ) { this._betrecordurl = value; }

    public get fullBetrecordurl () {
        return `${ this._betrecordurl }?token=${ this.token }&lang=en&serverurl=http%3A%2F%2Fgs-lab.game-rock.online`;
    }

    public get gameid () {
        return this._gameid;
    }
    public set gameid ( gameid: number ) {
        this._gameid = gameid;
    }
    public get token () {
        return this._token;
    }
    public set token ( token: string ) {
        this._token = token;
    }
    public get serverurl () {
        return this._serverurl;
    }
    public set serverurl ( serverurl: string ) {
        this._serverurl = serverurl;
    }

    public get windowSearch () {
        return this._windowSearch;
    }

    public get winLevelRate () {
        return this._winLevelRate;
    }

    public set bet_available_idx ( bet_available_idx: number ) {
        this._bet_available_idx = bet_available_idx;
    }

    public get bet_available_idx () {
        return this._bet_available_idx;
    }

    public get buyInformation () {
        return this._buyInformation;
    }

    public get testCurrency () {
        return this._testCurrency;
    }
    public set testCurrency ( testCurrency: string ) {
        this._testCurrency = testCurrency;
    }

    public get spinMode () {
        return this._spinMode;
    }
    public set spinMode ( spinMode: SpinMode ) {
        this._spinMode = spinMode;
    }
    public get urlLanguage () {
        return this._urlLanguage;
    }
    public set urlLanguage ( urlLanguage: string ) {
        this._urlLanguage = urlLanguage;
    }

    public get coinValue () {
        return this._coinValue;
    }
    public set coinValue ( coinValue: number ) {
        this._coinValue = coinValue;
    }
    //public get coinValueArray () : Array<number> {
    //    return this._coinValueArray;
    //}
    //public set coinValueArray ( coinValueArray: Array<number> ) {
    //    this._coinValueArray = coinValueArray;
    //}
    public get coinValueDefaultIndex () {
        return this._coinValueDefaultIndex;
    }
    public set coinValueDefaultIndex ( coinValueDefaultIndex: number ) {
        this._coinValueDefaultIndex = coinValueDefaultIndex;
    }
    public get lineBet () {
        return this._lineBet;
    }
    public set lineBet ( lineBet: number ) {
        this._lineBet = lineBet;
    }
    //public get lineBetArray () : Array<number> {
    //    return this._lineBetArray;
    //}
    //public set lineBetArray ( lineBetArray: Array<number> ) {
    //    this._lineBetArray = lineBetArray;
    //}
    public get lineBetDefaultIndex () {
        return this._lineBetDefaultIndex;
    }
    public set lineBetDefaultIndex ( lineBetDefaultIndex: number ) {
        this._lineBet = lineBetDefaultIndex;
    }
    public get lineTotal () {
        return this._lineTotal;
    }
    public set lineTotal ( lineTotal: number ) {
        this._lineTotal = lineTotal;
    }
    public get totalBet () {
        return this._totalBet;
    }
    public set totalBet ( totalBet: number ) {
        this._totalBet = totalBet;
    }
    public get betCredit () {
        return this._betCredit;
    }
    public set betCredit ( betCredit: number ) {
        this._betCredit = betCredit;
    }

    public set lang ( lang: string ) {
        this._lang = lang;
    }
    public get lang () {
        return this._lang;
    }

    public get currency () { return this._currency; }

    public setCurrency ( currency: string ) {
        this._currency = currency;
        if ( this._isDebugMode && this._testCurrency != null ) {
            currency = this._testCurrency;
        }
        
        this._currencySymbol = Config.currency[ currency ].symbol + ' ';
        this.fixedDigit = Config.currency[ currency ].fixedDigit;
    }

    public get currencyDecimalPoint () { return this.fixedDigit; }
};

export const gameInformation = new GameInformation;