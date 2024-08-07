import { _decorator, Component, Node, sp, Label, Color, Sprite, EventTarget, Input, input } from 'cc';
import { Machine } from '../../../sub_module/game/machine/Machine';
import { Payway4600, JP_TYPE } from '.././Payway4600';
import { Utils, DATA_TYPE } from '../../../sub_module/utils/Utils';
import { JpCoin } from './JpCoin';
import { AutoSpin } from '../../../sub_module/game/AutoSpin';
import { SoundManager } from '../../../sub_module/game/machine/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('JpGame4600')
export class JpGame4600 extends Component {
    public properties = {
        'clicked_type' : { [JP_TYPE.GRAND] : 0, [JP_TYPE.MAJOR] : 0, [JP_TYPE.MINOR] : 0, [JP_TYPE.MINI] : 0, },
        'jp_board_animation_type' : [ 'idle', 'idle', 'play02', 'play03' ],
        'idle_event' : null, // EventTarget
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
        },

        'idle' : {
            'label' : { [DATA_TYPE.TYPE]: Label, [DATA_TYPE.SCENE_PATH]: 'Canvas/JP Game/LastSec' },
        },
    }

    private readonly JP_BOARDS = [ [JP_TYPE.GRAND], [JP_TYPE.MAJOR], [JP_TYPE.MINOR], [JP_TYPE.MINI] ];

    public reset_idle_count() { 
        this.idle_count = 0; 
        if ( this.last_label.node.active === false ) return;
        this.last_label.string = '';
    }

    public onLoad(): void {
        this.node.setPosition(0, 0, 0);
        Utils.initData(this.initData, this);

        this.node.active = false;
        this.properties['idle_event'] = new EventTarget();
        this.idle_count = 0;

        input.on(Input.EventType.KEY_DOWN, this.reset_idle_count, this);
        input.on(Input.EventType.TOUCH_START, this.reset_idle_count, this);
        input.on(Input.EventType.MOUSE_MOVE, this.reset_idle_count, this);
    }

    private get machine() : Machine { return Machine.Instance; }
    private get paytable() : Payway4600 { return this.machine.paytable; }

    private set jp_type(value:JP_TYPE) { this.properties['jp_type'] = value; }
    private get jp_type():JP_TYPE { return this.properties['jp_type']; }

    private set jp_prize(value:number) { this.properties['jp_prize'] = value; }
    private get jp_prize():number { return this.properties['jp_prize']; }

    private get idle_event() : EventTarget { return this.properties['idle_event']; }
    private get idle_count() : number { return this.properties['idle_event']['count']; }
    private set idle_count(value:number) { this.properties['idle_event']['count'] = value; }

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
        this.idle_event['done'] = false;
        this.idle_count = 0;
        this.last_label.node.active = false;
        this.last_label.string = '';
    }

    /** 
     * 過場開關門動畫 
     * @param closeDoorCallFunction {Function} 關門後要做哪些事情
     */
    public async open_door(closeDoorCallFunction:Function) {
        let door = this.paytable.doorSpine;
        door.node.active = true;

        SoundManager.PlaySoundByID('sfx_door_close');           // 播放開門音效
        await Utils.playSpine(door, 'play', false);             // 關門動畫
        if ( closeDoorCallFunction ) closeDoorCallFunction();
        this.background.active = true;

        SoundManager.PlaySoundByID('sfx_door_open');            // 播放開門音效
        await Utils.playSpine(door, 'play02', false);           // 開門動畫
        door.node.active = false;
    }

    public async enter_jp_game(jp_type:JP_TYPE, jp_prize:number) {
        let jp_event = new EventTarget();
        this.jp_event = jp_event;
        this.jp_type = jp_type;
        this.jp_prize = jp_prize;
        this.reset_game();

        await this.paytable.play_pot_ani(true);

        SoundManager.PauseMusic();                              // 暫停音樂
        await this.open_door(() => {
            this.machine.controller.node.active = false;
            this.machine.node.active = false;
            this.node.active = true;
            SoundManager.PlayMusic('bgm_jp');                   // 播放JP音樂
        });

        this.keep_check_idle_count();                           // 偵測發呆行為

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
            if ( this.properties['coin'][i] == null ) continue;
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

    /**
     * 點擊錢幣
     * @param coin 
     * @returns 
     */
    public async click_coin(coin:JpCoin) {
        if (this.isBusy) return;
        if (this.isDone) return;

        this.isBusy = true;
        const type = this.get_random_type();
        const times = this.add_clicked_type(type);
        const isAnswer = times >= 3;

        this.play_jp_board_animation(type, times);

        if ( isAnswer === false ) {                         // 還沒有選滿三個
            coin.click_type(type, false, isAnswer);         // 開錢幣效果
            this.isBusy = false;                            // 打開點擊權限
            SoundManager.PlaySoundByID('sfx_jp_coin_open'); // 播放開錢幣音效
            return;
        }
        SoundManager.PlaySoundByID('sfx_jp_coin_finish');   // 播放選滿音效
        await coin.click_type(type, false, isAnswer);

        // * 選幣結束
        this.idle_event['done'] = true;                     // 停止偵測發呆行為
        this.isDone = true;
        this.reward_light_jp_board(type);
        this.light_coin();
        
        SoundManager.PlaySoundByID('sfx_jp_coin_open_all'); // 播放翻開剩下銅錢音效
        await this.open_last_coin();
        await Utils.delay(3000);                            // 看全部的 Coin
        await SoundManager.PauseMusic();                    // 暫停JP音樂
        SoundManager.PlayMusic('sfx_jp_total_win');         // 播放JP總獎金音效

        // * 打開獎金介面
        this.reward_label.string = '';
        await Utils.commonFadeIn(this.mask.node, false, [new Color(0,0,0,255), new Color(0,0,0,187)], this.mask, 0.3);
        await Utils.commonActiveUITween(this.reward_ui.node, true);

        const source = SoundManager.PlaySoundByID('sfx_totalwin_payout', true);  // 播放滾分音效
        Utils.playSpine(this.reward_spine, 'play', true);
        await Utils.commonTweenNumber(this.reward_label, 0, this.jp_prize, 1.5, Utils.numberCommaM );
        source.stop();                                         // 關閉滾分音效
        SoundManager.PlaySoundByID('sfx_totalwin_payout_end'); // 播放滾分結尾音效

        await Utils.delay(500);
        Utils.scaleFade(this.reward_label, 1, 3);
        
        SoundManager.PauseMusic();                             // 暫停JP總獎金音效
        await Utils.delay(3000);
        await this.exit_jp_game();
    }

    // 回到主遊戲
    public async exit_jp_game() {
        this.paytable.reset_pot_ani();
        await this.open_door(() => {
            this.machine.node.active            = true;
            this.machine.controller.node.active = true;
            this.node.active                    = false;
            if ( this.paytable.isFreeGame === false ) SoundManager.PlayMusic('0'); // 播放主遊戲音樂
            else SoundManager.PlayMusic('1');                                      // 播放FG遊戲音樂
        });

        this.jp_event.emit('done');
        this.machine.paytable.exit_jp_game();
    }

    /**
     * 偵測發呆行為，超過20秒幫忙開錢幣
     * @returns 
     */
    public async keep_check_idle_count() {
        
        if ( AutoSpin.StopSpinByUtilFeature() === true ) return;

        this.last_label.node.active = false;
        const idle_event = this.idle_event;
        this.idle_count = 0;
        while(this.idle_count<21) {
            this.idle_count++;
            await Utils.delay(1000);
            console.log('check_idle_count', this.idle_count);
            this.display_last_sec();

            if ( idle_event['done'] === true ) return; // 結束偵測
        }

        this.auto_click_coin();

    }

    // 發呆20秒，幫開錢幣
    public async auto_click_coin() {
        const coins = this.properties['coin'];
        const keys = Object.keys(coins);

        Utils.commonActiveUITween(this.last_label.node, false);

        while(true) {
            if ( this.isDone ) return;

            const random = Utils.Random(0, keys.length-1);
            const coin = coins[random].component;
            if ( coin.jp_type !== JP_TYPE.NONE ) continue;

            await Utils.delay(1000);
            await this.click_coin(coin);
        }
    }

    public get last_label() : Label { return this.properties['idle']['label'].component; }

    public async display_last_sec() {
        const label = this.last_label;
        const last = 20 - this.idle_count;

        if ( last < 0 ) return;
        if ( last > 10 ) return;
        await Utils.commonActiveUITween(label.node, false, true);
        label.string = last.toString();
        await Utils.commonActiveUITween(label.node, true, true);
        if ( last <= 3 ) await Utils.scaleFade(label, 1, 3);
    }

}

