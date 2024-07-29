import { _decorator, Component, EventTarget } from 'cc';
import { Utils } from '../../utils/Utils';
import { Machine } from '../machine/Machine';
import { Controller } from '../machine/controller_folder/Controller';
const { ccclass, property } = _decorator;

@ccclass('FreeGame')
export class FreeGame extends Component {


    public static async StartFreeGame(freeGameData: any[], roundCallback: Function = null) {
        console.log('StartFreeGame');
        console.log(freeGameData);
        const machine = Machine.Instance;
        let spinEvent = new EventTarget();

        Machine.Instance.fastStopping = false;
        Controller.ButtonSpinning(true); // 不停轉動Spin按鈕

        for(let i = 0; i < freeGameData.length; i++) {
            machine.paytable.spin(spinEvent);
            machine.paytable.setGameResult(freeGameData[i]);
            await Utils.delayEvent(spinEvent);
            machine.paytable.reelMaskActive(false);

            if ( roundCallback ) await roundCallback(freeGameData[i]);
        }
        
        Controller.ButtonSpinning(false); // 停止轉動Spin按鈕
        await Utils.delay(1000);

        console.log('EndFreeGame');
    }


}

