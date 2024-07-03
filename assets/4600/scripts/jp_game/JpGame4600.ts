import { _decorator, Component, Node, sp, Label } from 'cc';
import { Machine } from '../../../sub_module/game/machine/Machine';
import { Payway4600, JP_TYPE } from '.././Payway4600';
import { Utils, DATA_TYPE } from '../../../sub_module/utils/Utils';
import { JpCoin } from './JpCoin';
const { ccclass, property } = _decorator;

@ccclass('JpGame4600')
export class JpGame4600 extends Component {
    private properties = {};

    private get background() : Node { return this.properties['Background']['node'].node; }

    private readonly initData = {
        'Background' : {
            'node' : { [DATA_TYPE.NODE_PATH]: 'Background', [DATA_TYPE.TYPE]: Node },
        },
        'jp' : {
            'grand_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Grand'  },
            'major_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Major'  },
            'minor_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Minor'  },
            'mini_ani'  : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Mini'  },
            'grand'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Grand/Value'},
            'major'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Major/Value'},
            'minor'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Minor/Value'},
            'mini'      : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Mini/Value'},
        },

        'coin' : { // 總共有 12 個
            0 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-000' },
            1 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-001' },
            2 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-002' },
            3 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-003' },
            4 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-004' },
            5 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-005' },
            6 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-006' },
            7 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-007' },
            8 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-008' },
            9 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-009' },
            10 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-010' },
            11 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-011' },
        }
    }

    public onLoad(): void {
        this.node.setPosition(0, 0, 0);
        Utils.initData(this.initData, this);
        console.log('JpGame4600.onLoad', this);

        this.node.active = false;
    }

    private get machine() : Machine { return Machine.Instance; }
    private get paytable() : Payway4600 { return this.machine.paytable; }

    public async enter_jp_game() {
        this.reset_coin();
        this.update_jp_value();
        await this.paytable.play_pot_ani(5);

        let door = this.paytable.doorSpine;
        door.node.active = true;
        console.log('door', door);

        await Utils.playSpine(door, 'play', false); // 關門動畫
        this.machine.controller.node.active = false;
        this.machine.node.active = false;
        this.node.active = true;
        this.background.active = true;
        await Utils.playSpine(door, 'play02', false); // 開門動畫
    }

    private update_jp_value() {
        const JP_REWARD = this.paytable.JP_REWARD;
        const totalBet = this.machine.totalBet;
        console.log('grand', this.properties['jp']['grand'].component);
        this.properties['jp']['grand'].component.string = Utils.numberCommaM(totalBet * JP_REWARD[JP_TYPE.GRAND]);
        this.properties['jp']['major'].component.string = Utils.numberCommaM(totalBet * JP_REWARD[JP_TYPE.MAJOR]);
        this.properties['jp']['minor'].component.string = Utils.numberCommaM(totalBet * JP_REWARD[JP_TYPE.MINOR]);
        this.properties['jp']['mini'].component.string = Utils.numberCommaM(totalBet * JP_REWARD[JP_TYPE.MINI]);
    }

    private reset_coin() {
        for (let i = 0; i < 12; i++) {
            this.properties['coin'][i].component.reset();
        }
    }

    public async click_coin(coin:any) {
        console.log('click_coin', coin);
    }

}

