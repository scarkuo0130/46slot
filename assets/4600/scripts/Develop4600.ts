import { _decorator, Component, Node } from 'cc';
import { set } from 'mobx';
import { Utils, _utilsDecorator } from '../../sub_module/utils/Utils';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('Develop4600')
export class Develop4600 extends Component {

    @property({type:cc.boolean, displayName:'模擬覆寫 machine.spinResponse'})
    public isOverrideSpinResponse:boolean = false;


    public static Instance: Develop4600 = null;

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
    }

    /** 開發期間的覆寫函式 */
    @isDevelopFunction(true)
    private developOverrideFunction() {
        if (this.isOverrideSpinResponse ) this.machine.spinResponse = this.developSpinResponse.bind(this);
    }

    /** 開發期間複寫 machine.spinResponse */
    @isDevelopFunction(true)
    public developSpinResponse(spinData:any) {
        
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

        // 原本的 machine.spinResponse
        console.log('developSpinResponse', spinData);
        let event = this.machine.properties['spinEvent'];
        event['result'] = spinData;
        this.machine.properties['spinData'] = spinData;
        event.emit('done');
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

}

