import { _decorator, Component, Node, sp, Sprite } from 'cc';
import { Utils } from '../../sub_module/utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('test')
export class test extends Component {
    start() {
        this.loop();
    }

    private times = 0;

    async loop() {
        await Utils.delay(1000);
        let comp = this.node.getComponent(sp.Skeleton);
        await Utils.scaleFade(comp, 1, 5);
        this.times++;
        if ( this.times > 5 ) return;
        this.loop();
    }
}

