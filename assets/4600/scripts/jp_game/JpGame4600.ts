import { _decorator, Component, Node, sp, Label, Color, Sprite, EventTarget } from 'cc';
import { Machine } from '../../../sub_module/game/machine/Machine';
import { Payway4600, JP_TYPE } from '.././Payway4600';
import { Utils, DATA_TYPE } from '../../../sub_module/utils/Utils';
import { JpCoin } from './JpCoin';
const { ccclass, property } = _decorator;

@ccclass('JpGame4600')
export class JpGame4600 extends Component {
    public properties = {
        'clicked_type' : { [JP_TYPE.GRAND] : 0, [JP_TYPE.MAJOR] : 0, [JP_TYPE.MINOR] : 0, [JP_TYPE.MINI] : 0, },
        'jp_board_animation_type' : [ 'idle', 'idle', 'play02', 'play03' ],
    };

    private get background() : Node { return this.properties['Background']['node'].node; }

    private readonly initData = {
        'Background' : {
            'node' : { [DATA_TYPE.NODE_PATH]: 'Background', [DATA_TYPE.TYPE]: Node },
        },
        'jp' : {
            [JP_TYPE.GRAND] : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Grand'  },
            [JP_TYPE.MAJOR] : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Major'  },
            [JP_TYPE.MINOR] : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Minor'  },
            [JP_TYPE.MINI]  : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Mini'  },
            'grand'         : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Grand/Value'},
            'major'         : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Major/Value'},
            'minor'         : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Minor/Value'},
            'mini'          : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Items/JP Mini/Value'},
        },

        'reward_ui' : {
            'mask'          : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Mask' },
            [JP_TYPE.GRAND] : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Grand' },
            [JP_TYPE.MAJOR] : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Major' },
            [JP_TYPE.MINOR] : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Minor' },
            [JP_TYPE.MINI]  : { [DATA_TYPE.TYPE]: Sprite, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Mini' },
        },

        'reward_spine' : {
            [JP_TYPE.GRAND] : { [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Grand/UI' },
            [JP_TYPE.MAJOR] : { [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Major/UI' },
            [JP_TYPE.MINOR] : { [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Minor/UI' },
            [JP_TYPE.MINI]  : { [DATA_TYPE.TYPE]: sp.Skeleton, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Mini/UI' },
        },

        'reward_label' : {
            [JP_TYPE.GRAND] : { [DATA_TYPE.TYPE]: Label, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Grand/Label' },
            [JP_TYPE.MAJOR] : { [DATA_TYPE.TYPE]: Label, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Major/Label' },
            [JP_TYPE.MINOR] : { [DATA_TYPE.TYPE]: Label, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Minor/Label' },
            [JP_TYPE.MINI]  : { [DATA_TYPE.TYPE]: Label, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/Reward/Mini/Label' },
        },

        'coin' : { // 總共有 12 個
            0  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-000' },
            1  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-001' },
            2  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-002' },
            3  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-003' },
            4  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-004' },
            5  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-005' },
            6  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-006' },
            7  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-007' },
            8  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-008' },
            9  : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-009' },
            10 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-010' },
            11 : { [DATA_TYPE.TYPE] : JpCoin, [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game/Coins/Coin-011' },
        }
    }

    private readonly JP_BOARDS = [ [JP_TYPE.GRAND], [JP_TYPE.MAJOR], [JP_TYPE.MINOR], [JP_TYPE.MINI] ];

    public onLoad(): void {
        this.node.setPosition(0, 0, 0);
        Utils.initData(this.initData, this);

        this.node.active = false;
    }

    private get machine() : Machine { return Machine.Instance; }
    private get paytable() : Payway4600 { return this.machine.paytable; }

    private set jp_type(value:JP_TYPE) { this.properties['jp_type'] = value; }
    private get jp_type():JP_TYPE { return this.properties['jp_type']; }

    private set jp_prize(value:number) { this.properties['jp_prize'] = value; }
    private get jp_prize():number { return this.properties['jp_prize']; }

    private get_clicked_type(JP_TYPE) { return this.properties['clicked_type'][JP_TYPE]; }
    private add_clicked_type(JP_TYPE) { 
        this.properties['clicked_type'][JP_TYPE]++; 
        return this.properties['clicked_type'][JP_TYPE];
    }

    private get isBusy() : boolean { return this.properties['isBusy']; }
    private set isBusy(value:boolean) { this.properties['isBusy'] = value; }
    private get isDone() : boolean { return this.properties['isDone']; }
    private set isDone(value:boolean) { this.properties['isDone'] = value; }

    private get mask() : Sprite { return this.properties['reward_ui']['mask'].component; }

    private jp_board_spine(type:JP_TYPE) : sp.Skeleton { return this.properties['jp'][type].component; }

    private get reward_ui() : Sprite { return this.properties['reward_ui'][this.jp_type].component; }
    private get reward_label() : Label { return this.properties['reward_label'][this.jp_type].component; }
    private get reward_spine() : sp.Skeleton { return this.properties['reward_spine'][this.jp_type].component; }

    private get jp_event() : EventTarget { return this.properties['jp_event']; }
    private set jp_event(value:EventTarget) { this.properties['jp_event'] = value; }

    private play_jp_board_animation(type:JP_TYPE, index:number) {
        const loop = index === 0 ? false : true;
        this.jp_board_spine(type).setAnimation(0, this.properties['jp_board_animation_type'][index], loop);
    }

    private light_jp_board(type:JP_TYPE, active:boolean) {
        const color : Color = new Color(255, 255, 255, 255);
        if ( active === true ) {
            color.a = 255;
            this.jp_board_spine(type).setAnimation(0, 'play02', true);
        } else {
            color.a = 128;
            this.jp_board_spine(type).setAnimation(0, 'idle', false);
        }
        
        this.jp_board_spine(type).color = color;
    }

    private reward_light_jp_board(type:JP_TYPE) {
        for (let i = 0; i < 4; i++) {
            const type = this.JP_BOARDS[i][0];
            const active = this.jp_type === type;
            this.light_jp_board(type, active);
        }
    }

    private reset_jp_board() {
        this.play_jp_board_animation(JP_TYPE.GRAND, 0);
        this.play_jp_board_animation(JP_TYPE.MAJOR, 0);
        this.play_jp_board_animation(JP_TYPE.MINOR, 0);
        this.play_jp_board_animation(JP_TYPE.MINI, 0);
        this.jp_board_spine(JP_TYPE.GRAND).color = Color.WHITE;
        this.jp_board_spine(JP_TYPE.MAJOR).color = Color.WHITE;
        this.jp_board_spine(JP_TYPE.MINOR).color = Color.WHITE;
        this.jp_board_spine(JP_TYPE.MINI).color  = Color.WHITE;
    }

    private reset_game() {
        this.properties['clicked_type'] = { [JP_TYPE.GRAND] : 0, [JP_TYPE.MAJOR] : 0, [JP_TYPE.MINOR] : 0, [JP_TYPE.MINI] : 0, };
        this.properties['reward_ui'][JP_TYPE.GRAND].node.active = false;
        this.properties['reward_ui'][JP_TYPE.MAJOR].node.active = false;
        this.properties['reward_ui'][JP_TYPE.MINOR].node.active = false;
        this.properties['reward_ui'][JP_TYPE.MINI].node.active  = false;
        this.isDone = false;
        this.isBusy = true;
        this.reset_jp_board();
        this.reset_coin();
        this.update_jp_value();
        this.mask.node.active = false;
    }

    /** 
     * 過場開關門動畫 
     * @param closeDoorCallFunction {Function} 關門後要做哪些事情
     */
    public async open_door(closeDoorCallFunction:Function) {
        let door = this.paytable.doorSpine;
        door.node.active = true;

        await Utils.playSpine(door, 'play', false); // 關門動畫
        closeDoorCallFunction();
        this.background.active = true;
        await Utils.playSpine(door, 'play02', false); // 開門動畫
    }

    public async enter_jp_game(jp_type:JP_TYPE, jp_prize:number) {
        let jp_event = new EventTarget();
        this.jp_event = jp_event;
        this.jp_type = jp_type;
        this.jp_prize = jp_prize;
        this.reset_game();

        await this.paytable.play_pot_ani(true);
        await this.open_door(() => {
            this.machine.controller.node.active = false;
            this.machine.node.active = false;
            this.node.active = true;
        });

        this.isBusy = false;
        await Utils.delayEvent(jp_event);
        jp_event = null;
    }

    private update_jp_value() {
        const JP_REWARD = this.paytable.JP_REWARD;
        const totalBet = this.machine.totalBet;
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

    private light_coin() {
        for (let i = 0; i < 12; i++) {
            this.properties['coin'][i].component.light_type(this.jp_type);
        }
    }

    private get_random_type() : JP_TYPE {
        let type;
        let count = 0;
        while(true) {
            count++;
            // 安全措施
            if ( count >= 20 ) return this.jp_type;

            let random = Utils.Random(0, 3);
            let type = this.JP_BOARDS[random][0];
            let times = this.get_clicked_type(type);
            if ( times === 2  && this.jp_type !== type ) continue;
            return type;
        }
    }

    private get_last_type() : JP_TYPE {
        let type;

        while(true) {
            let random = Utils.Random(0, 4);
            let type = this.JP_BOARDS[random][0];
            let times = this.get_clicked_type(type);
            if ( times >= 3 ) continue;

            this.add_clicked_type(type);
            return type;
        }
    }

    private async open_last_coin() {
        for (let i = 0; i < 12; i++) {
            if ( this.properties['coin'][i].component.jp_type != JP_TYPE.NONE ) continue;
            this.properties['coin'][i].component.click_type(this.get_last_type(), true);
            // await Utils.delay(300);
        }
    }

    public async click_coin(coin:JpCoin) {
        if (this.isBusy) return;
        if (this.isDone) return;

        this.isBusy = true;
        const type = this.get_random_type();
        const times = this.add_clicked_type(type);
        const isAnswer = times >= 3;

        await coin.click_type(type, false, isAnswer);
        this.play_jp_board_animation(type, times);

        if ( isAnswer === false ) { // 還沒有結束
            this.isBusy = false;
            return;
        }

        // 結束
        this.isDone = true;
        this.reward_light_jp_board(type);
        this.light_coin();
        await this.open_last_coin();
        await Utils.delay(3000); // 看全部的 Coin

        // 打開獎金介面
        this.reward_label.string = '';
        await Utils.commonFadeIn(this.mask.node, false, [new Color(0,0,0,255), new Color(0,0,0,187)], this.mask, 0.3);
        await Utils.commonActiveUITween(this.reward_ui.node, true);
        Utils.playSpine(this.reward_spine, 'play', true);
        await Utils.commonTweenNumber(this.reward_label, 0, this.jp_prize, 1.5, Utils.numberCommaM );
        await Utils.delay(500);
        Utils.scaleFade(this.reward_label, 1, 3);
        
        await Utils.delay(3000);
        await this.exit_jp_game();
    }

    // 回到主遊戲
    public async exit_jp_game() {
        await this.open_door(() => {
            this.machine.node.active = true;
            this.machine.controller.node.active = true;
            this.node.active = false;
        });

        this.jp_event.emit('done');
        this.machine.paytable.exit_jp_game();
    }

}

