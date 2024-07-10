import { _decorator, Component, Node } from 'cc';
import { Utils } from '../../utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('FreeGame')
export class FreeGame extends Component {


    public static async StartFreeGame(freeGameData: any[]) {
        console.log('StartFreeGame');
        console.log(freeGameData);
        await Utils.delay(1000);
    }


}

