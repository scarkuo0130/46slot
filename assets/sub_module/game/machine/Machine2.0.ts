import { _decorator, Component, Node } from 'cc';
import { AutoSpin } from '../AutoSpin';
import { Controller2_0 } from './controller_folder/Controller2.0';
const { ccclass, property } = _decorator;

@ccclass('Machine2_0')
export class Machine2_0 extends Component {
    public static readonly SPEED_MODE = { NORMAL: 0, TURBO: 2, QUICK: 1, DEFAULT:1, MAX:2 };

    protected properties = {
        'controller' : null,
        'speedMode' : Machine2_0.SPEED_MODE.DEFAULT,
    };

    public setSpeedMode(mode:number) {
        this.properties['speedMode'] = mode;
        AutoSpin.ChangeSpeedMode(mode);
        return mode;
    }

    public get SpeedMode() { return this.properties['speedMode']; }

    public get controller() { return this.properties['controller']; }
    
    public static Instance: Machine2_0 = null;
    protected onLoad(): void {
        Machine2_0.Instance = this;
        this.init();
    }

    private init() {
        this.properties['controller'] = Controller2_0.Instance;
    }

    public startAutoSpin() {
        console.log('startAutoSpin');
    }


}

