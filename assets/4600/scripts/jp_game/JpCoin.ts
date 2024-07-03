import { _decorator, Component, Node, sp } from 'cc';
import { Utils, DATA_TYPE } from '../../../sub_module/utils/Utils';
import { Machine } from '../../../sub_module/game/machine/Machine';
import { JpGame4600 } from './JpGame4600';
import { JP_TYPE } from '../Payway4600';
const { ccclass, property } = _decorator;

@ccclass('JpCoin')
export class JpCoin extends Component {
    public properties = {};
    private readonly initData = {
        'coin' : {
            'default' : { [DATA_TYPE.NODE_PATH]: 'Default', [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.CLICK_EVENT]: this.on_click, },
            [JP_TYPE.GRAND]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/0', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MAJOR]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/1', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MINOR]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/2', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MINI]    : { [DATA_TYPE.NODE_PATH]: 'Clicked/3', [DATA_TYPE.TYPE]: sp.Skeleton },
        }
    }

    public onLoad(): void {
        Utils.initData(this.initData, this);
    }

    public on_click() {
        let jpGame : JpGame4600 = Machine.Instance.paytable.jpGame;
        jpGame.click_coin(this);
    }

    public reset() {
        if ( this.properties['coin'] == null ) Utils.initData(this.initData, this);
        
        this.properties['coin']['default'].node.active = true;
        this.properties['coin'][JP_TYPE.GRAND].node.active = false;
        this.properties['coin'][JP_TYPE.MAJOR].node.active = false;
        this.properties['coin'][JP_TYPE.MINOR].node.active = false;
        this.properties['coin'][JP_TYPE.MINI].node.active = false;

        this.properties['coin']['default'].component.setAnimation(0, 'idle', false);
    }
}

