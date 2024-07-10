import { _decorator, Component, EventTarget } from 'cc';
import { Utils } from '../../utils/Utils';
import { Machine } from '../machine/Machine';
const { ccclass, property } = _decorator;

@ccclass('FreeGame')
export class FreeGame extends Component {


    public static async StartFreeGame(freeGameData: any[], roundCallback: Function = null) {
        console.log('StartFreeGame');
        console.log(freeGameData);
        const machine = Machine.Instance;
        let spinEvent = new EventTarget();

        for(let i = 0; i < freeGameData.length; i++) {
            machine.paytable.spin(spinEvent);
            machine.paytable.setGameResult(freeGameData[i]);
            await Utils.delayEvent(spinEvent);
            if ( roundCallback ) await roundCallback(freeGameData[i]);
        }

        await Utils.delay(1000);
        console.log('EndFreeGame');
    }


}

