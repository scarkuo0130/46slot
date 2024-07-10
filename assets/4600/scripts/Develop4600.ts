import { _decorator, Component, sys,Button } from 'cc';
import { Utils, _utilsDecorator } from '../../sub_module/utils/Utils';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('Develop4600')
export class Develop4600 extends Component {

    @property({displayName:'模擬覆寫 machine.spinResponse'})
    public isOverrideSpinResponse:boolean = false;


    public static Instance: Develop4600 = null;
    public simulateFeatureGame:boolean = false;

    @isDevelopFunction(true)
    onLoad() {
        Develop4600.Instance = this;
        cc.develop = this;
    }

    public get machine() { return cc.machine; }

    @isDevelopFunction(true)
    async start() {
        await Utils.delay(1000);
        if ( this.machine == null ) return;
        this.developOverrideFunction();
        cc.develop = this;
    }

    /** 開發期間的覆寫函式 */
    @isDevelopFunction(true)
    private async developOverrideFunction() {
        if ( !this.isOverrideSpinResponse ) return;
        this.machine.spinResponse = this.developSpinResponse.bind(this);

        // 移除 onclick 
        let buttonNode : Node = this.machine.paytable.buyFeatureGame.properties.BuyFeatureGameUI.buyButton.node;
        buttonNode.on('click', this.DevelopClickBuyFeatureGame, this);
    }

    /**
     * 攔截 paytable buyFeatureGameUI 的 clickBuyFeatureGame
     */
    private DevelopClickBuyFeatureGame() {
        this.simulateFeatureGame = true;
        return this.machine.controller.clickSpin();
    }

    /** 開發期間複寫 machine.spinResponse */
    @isDevelopFunction(true)
    public developSpinResponse(spinData:any) {

        let mainGames = this.saveMainGame(spinData);
        
        if ( this.simulateFeatureGame ) {
            this.make_subGameResponse(spinData);
            this.simulateFeatureGame = false;
        }

        // 有沒有 wild
        if ( this.haveWild(spinData) ) {
            let jp_level = this.machine.paytable.JP_LEVEL + 1;
            if ( jp_level > 4 ) {
                jp_level = 4;
                let jp = Utils.Random(0, 3);
                let jp_prize = this.machine.totalBet * this.machine.paytable.JP_REWARD[jp];
                spinData['main_game']['extra']['jp_type'] = jp;
                spinData['main_game']['extra']['jp_prize'] = jp_prize;
            }
            spinData['main_game']['extra']['jp_level'] = jp_level;
        }

        console.log('spinData', spinData);
        // 以下是原本的 machine.spinResponse
        let event = this.machine.properties['spinEvent'];
        event['result'] = spinData;
        this.machine.properties['spinData'] = spinData;
        event.emit('done');
    }

    public simulateFeatureGameSpinResponse() {
        let mainGameList = this.loadStorage('mainGame');
        if ( mainGameList.length < 10 ) return alert('請先 Spin 10 次以上');

        let result = [];
        let pay_credit_total = 0;
        for(let i = 0; i < 10; i++) {
            let mainGame = mainGameList[i];
            mainGame.extra['free_spin_times'] = 0;
            pay_credit_total += mainGame['pay_credit_total'];
            result.push(mainGame);
        }

        return { 'pay_credit_total' : pay_credit_total, 'result' : result };
    }

    private make_subGameResponse(spinData) {
        spinData['sub_game'] = this.simulateFeatureGameSpinResponse();
        spinData['get_sub_game'] = true;
        spinData['main_game']['extra']['free_spin_times'] = 10;

        spinData['main_game']['game_result'][0][1] = 12;
        spinData['main_game']['game_result'][2][1] = 12;
        spinData['main_game']['game_result'][4][1] = 12;
    }

    private saveMainGame(spinData:any) {
        let mainGame = spinData['main_game'];
        
        let mainGameList = this.loadStorage('mainGame');
        if ( mainGameList == null ) mainGameList = [];
        mainGameList.push(mainGame);

        if ( mainGameList.length > 30 ) mainGameList.shift();

        this.saveStorage('mainGame', mainGameList);
        return mainGameList;
    }

    private saveStorage(key:string, value:any) {
        sys.localStorage.setItem(key, JSON.stringify(value));
    }

    private loadStorage(key:string) {
        let value = sys.localStorage.getItem(key);
        return JSON.parse(value);
    }

    private removeStorage(key:string) {
        sys.localStorage.removeItem(key);
    }

    private getStorageKeys() {
        let keys = [];
        for(let i = 0; i < sys.localStorage.length; i++) {
            keys.push(sys.localStorage.key(i));
        }
        return keys;
    }

    @isDevelopFunction(true)
    private haveWild(spinData:any) {
        let reel : number[][] = spinData['main_game']['game_result'];
        let haveWild = false;
        for(let i = 0; i < reel.length; i++) {
            if ( haveWild ) break;
            let row = reel[i];
            for(let j = 0; j < row.length; j++) {
                if ( row[j] === 0 ) {
                    haveWild = true;
                    break;
                }
            }
        }
        
        return haveWild;
    }

    private nowDateTime() : string {
        const date = new Date();
        const mm = date.getMonth() + 1; // getMonth() is zero-based
        const dd = date.getDate();
        const hh = date.getHours();
        const min = date.getMinutes();
        const ss = date.getSeconds();

        return [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('') + (hh>9 ? '' : '0') + hh + (min>9 ? '' : '0') + min + (ss>9 ? '' : '0') + ss;
    }
}

