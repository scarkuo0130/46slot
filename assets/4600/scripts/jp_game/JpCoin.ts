import { _decorator, Component, Sprite, sp, Color } from 'cc';
import { Utils, DATA_TYPE } from '../../../sub_module/utils/Utils';
import { Machine } from '../../../sub_module/game/machine/Machine';
import { JpGame4600 } from './JpGame4600';
import { JP_TYPE } from '../Payway4600';
const { ccclass, property } = _decorator;

@ccclass('JpCoin')
export class JpCoin extends Component {
    public properties = {};
    
    public get jp_type() : JP_TYPE { return this.properties['jp_type']; }
    public set jp_type(value : JP_TYPE) { this.properties['jp_type'] = value; }

    public async click_type(value: JP_TYPE, isLast: boolean=false) {
        this.jp_type = value;

        const coin_spine = this.properties['coin']['default'].component;
        const jp_spine = this.properties['coin'][value].component;

        if ( !isLast ) await Utils.playSpine(coin_spine, 'play02', false, 2);
        await Utils.playSpine(coin_spine, 'play03', false, 2);
        coin_spine.node.active = false;
        jp_spine.node.active = true;

        await Utils.playSpine(jp_spine, 'play02', false, 2);
    }

    public light_type(value: JP_TYPE) {
        if ( value === JP_TYPE.NONE ) return this.properties['coin']['body'].component.color = Color.WHITE;

        let color = this.properties['coin']['body'].component.color;
        if ( value == this.jp_type ) {
            color.a = 255;
        } else {
            color.a = 100;
        }

        this.properties['coin']['body'].color = color;
    }

    private readonly initData = {
        'coin' : {
            'body'            : { [DATA_TYPE.NODE_PATH]: '',          [DATA_TYPE.TYPE]: Sprite },
            'default'         : { [DATA_TYPE.NODE_PATH]: 'Default',   [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.CLICK_EVENT]: this.on_click, },
            [JP_TYPE.GRAND]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/0', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MAJOR]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/1', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MINOR]   : { [DATA_TYPE.NODE_PATH]: 'Clicked/2', [DATA_TYPE.TYPE]: sp.Skeleton },
            [JP_TYPE.MINI]    : { [DATA_TYPE.NODE_PATH]: 'Clicked/3', [DATA_TYPE.TYPE]: sp.Skeleton },
        },
    }

    public on_click() {
        if ( this.jp_type != JP_TYPE.NONE ) return;

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
        this.light_type(JP_TYPE.NONE);
        this.jp_type = JP_TYPE.NONE;
        
    }
}

