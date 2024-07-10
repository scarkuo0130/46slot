import { _decorator, Color, Label, Node, Sprite, sp, Vec3, tween, Button, ParticleSystem2D } from 'cc';
import { Utils, DATA_TYPE, TWEEN_EASING_TYPE } from '../../sub_module/utils/Utils';
import { Symbol } from '../../sub_module/game/machine/Symbol';
import { Payway } from '../../sub_module/game/machine/pay/Payway';
import { Viewport, Orientation } from '../../sub_module/utils/Viewport';
import { ObjectPool } from '../../sub_module/game/ObjectPool';
import { JpGame4600 } from './jp_game/JpGame4600';
import { FreeGame } from '../../sub_module/game/FeatureGame/FreeGame';
const { ccclass, property } = _decorator;


export enum JP_TYPE {
    GRAND = 0,
    MAJOR = 1,
    MINOR = 2,
    MINI = 3,
    POT = 4,
    NONE = -1,
}

export var WildID = 0;

@ccclass('Payway4600')
export class Payway4600 extends Payway {

    //多福(GRAND)-10000x、多財(MAJOR)-1000x、多喜(MINOR)-100x、多壽(MINI)-10x
    public readonly JP_REWARD = {
        [JP_TYPE.GRAND] : 10000,
        [JP_TYPE.MAJOR] : 1000,
        [JP_TYPE.MINOR] : 100,
        [JP_TYPE.MINI]  : 10,
    };

    public jp(type:number) { return this.properties['jp'][type]; }

    // 目前聚寶盆等級
    public get JP_LEVEL() : number { return this.properties['jp_level']; }
    public set JP_LEVEL(value:number) { this.properties['jp_level'] = value; }

    public get jpGame(): JpGame4600 { return this.properties['jp']['game'].component; }

    private readonly onloadData = {
        'preload' : {
            'mask'     : { [DATA_TYPE.TYPE] : Sprite,        [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/PreLoad/Mask'  },
            'pDoor'    : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/PreLoad/Portrait/door'  },
            'lDoor'    : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/PreLoad/Landscape/door'  },
        },
    
        'jp' : {
            'grand_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Grand'  },
            'major_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Major'  },
            'minor_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Minor'  },
            'mini_ani'  : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Mini'  },
            'pot_ani'   : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Treasure Pot'  },
            'wild_soul' : { [DATA_TYPE.TYPE] : Node,            [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/Wild Soul'  },
            'grand'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Grand/Value'},
            'major'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Major/Value'},
            'minor'     : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Minor/Value'},
            'mini'      : { [DATA_TYPE.TYPE] : Label,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Mini/Value'},
            'game'      : { [DATA_TYPE.TYPE] : JpGame4600,      [DATA_TYPE.SCENE_PATH] : 'Canvas/JP Game'  },
        },

        'buyFeature' : {
            'button'  : { [DATA_TYPE.TYPE] : Button,            [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Buy Feature Game'  },
        },

        'perform' : {
            'score_board' : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Reel/RewardWindow'  },
        },

        'freeGame' : {
            'main' : { [DATA_TYPE.TYPE] : Node,                 [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI'  },
            'trigger_ui' : { [DATA_TYPE.TYPE] : sp.Skeleton,    [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/Trigger Game'  },
        },

        'background' : {
            'main' : { [DATA_TYPE.TYPE] : Node,                 [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Background/Main Background'  },
            'freeGame' : { [DATA_TYPE.TYPE] : Node,             [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Background/FG Background'  },
        },
    };

    protected onload() { 
        Utils.initData(this.onloadData, this);
        this.properties['preload']['mask'].node.active = true;
        this.properties['preload']['pDoor'].node.active = true;
        this.properties['preload']['lDoor'].node.active = true;
        // this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT]?.setAnimation(0, 'idle', false);
        this.properties['jp']['grand_ani'][DATA_TYPE.COMPONENT].setAnimation(0, 'idle', false);
        this.properties['jp']['major_ani'][DATA_TYPE.COMPONENT].setAnimation(0, 'idle', false);
        this.properties['jp']['minor_ani'][DATA_TYPE.COMPONENT].setAnimation(0, 'idle', false);
        this.properties['jp']['mini_ani'][DATA_TYPE.COMPONENT].setAnimation(0, 'idle', false);
        this.properties['jp'][JP_TYPE.GRAND] = { 'ani' : this.properties['jp']['grand_ani'], 'value': this.properties['jp']['grand'] };
        this.properties['jp'][JP_TYPE.MAJOR] = { 'ani' : this.properties['jp']['major_ani'], 'value': this.properties['jp']['major'] };
        this.properties['jp'][JP_TYPE.MINOR] = { 'ani' : this.properties['jp']['minor_ani'], 'value': this.properties['jp']['minor'] };
        this.properties['jp'][JP_TYPE.MINI]  = { 'ani' : this.properties['jp']['mini_ani'],  'value': this.properties['jp']['mini'] };
        this.properties['jp'][JP_TYPE.POT]   = { 'ani' : this.properties['jp']['pot_ani'] };
        this.properties['freeGame']['main'].node.setPosition(0, 0, 0);
        this.properties['background']['freeGame'].node.active = false;

        ObjectPool.registerNode('soul', this.properties['jp']['wild_soul'].node);
        this.properties['jp']['wild_soul'].node.active = false;

        this.doorSpine.node.active = true;
        Utils.playSpine(this.doorSpine, 'idle', false, 1, true);
    }
    // 給予專案 start 使用
    protected onstart() { 
        this.properties['freeGame']['trigger_ui'].node.active = false;

        this.machine.controller.addDisableButtons(this.properties['buyFeature']['button'].component);
        Utils.AddHandHoverEvent(this.properties['buyFeature']['button'].node);
        console.log(this);
    }

    /**
     * 進入遊戲
     */
    public enterGame() {
        this.scoreBoard.node.active = false;
        this.preload_open_door();       // 開門動畫
    }

    // 顯示分數的背板
    protected get scoreBoard() : sp.Skeleton { return this.properties['perform']['score_board'].component; }

    /**
     * 進入報獎流程
     * @override 可覆寫
     * @from paytable.spin()
     */
    private async processWinningScore() {
        const gameResult = this.gameResult;
        const free_game : boolean = gameResult.extra.free_spin_times > 0;

        console.log('gameResult', gameResult);

        // 聚寶盆動畫，如果有JP遊戲，先進去玩
        await this.absorbWildSymbolIntoTreasurePot();
        
        if ( !free_game ) { // 假如沒有 free_game, 就回去報獎流程
            return super.processWinningScore();
        }

        // 進入JP遊戲
        console.log('進入JP遊戲');
    }

    /**
     * 播放全部獎項
     */
    protected async performAllPayline() {
        this.scoreBoard.node.active = true;
        await Utils.commonFadeIn(this.scoreBoard.node, false, null, this.scoreBoard);
        this.scoreBoard.setAnimation(0, 'play', false);
        await super.performAllPayline();
        this.scoreBoard.node.active = false;
    }

    /**
     *  聚寶盆吸收 Wild Symbol動畫
     */
    private async absorbWildSymbolIntoTreasurePot() {
        // 盤面是否有 Wild Symbol
        const wilds = this.reel.showWinSymbol(WildID);
        if (wilds.length === 0) return false;

        this.reel.closeNearMissMask();  // 關閉 NearMiss 遮罩

        let self = this;
        let machine = this.machine.node;
        // 打開遮罩
        // this.reelMaskActive(true);
        wilds.forEach( async (wild) => {
            const symbol = wild.getComponent(Symbol);
            const spine = symbol.spine;
            spine.setAnimation(0, 'play02', false);
            await Utils.delay(300);

            const soul = ObjectPool.Get('soul');
            soul.parent = machine;
            soul.worldPosition = wild.worldPosition;
            soul.active = true;
            const toPos = self.jp(JP_TYPE.POT).ani.node.worldPosition.clone();
            toPos.x += Utils.Random(-25, 25);
            toPos.y += Utils.Random(-25, 25);

            let onFinished = ()=>{ Utils.delay(1000).then(()=>{ObjectPool.Put('soul', soul)}) };
            Utils.tweenBezierCurve(soul, toPos, 1, onFinished, true);
        });

        // 等待動畫播完
        await Utils.delay(400);
        if ( this.gameResult.extra?.jp_prize > 0 ) {             
            const {jp_type, jp_prize} = this.gameResult.extra;
            await Utils.delay(1000);
            return await this.jpGame.enter_jp_game(jp_type, jp_prize);
        }

        this.reel.moveBackToWheel();
        this.play_pot_ani(this.gameResult.extra.jp_level);
        return true;
    }

    public async exit_jp_game() {
        this.play_pot_ani(0);
        this.machine.featureGame = false;
    }

    /**
     * 進入JP遊戲
     */
    private async enter_jp_game() {
        await this.play_pot_ani(5);

        let door = this.doorSpine;
        door.node.active = true;

        await Utils.playSpine(door, 'play', false); // 關門動畫
    }


    /** 開場動畫 */
    private async preload_open_door() {
        let door = this.doorSpine;
        
        this.properties['preload']['mask'].node.active = true;
        door.node.active = true;
        door.setAnimation(0, 'play02', false);
        door.paused = true;

        await Utils.commonFadeIn(this.properties['preload']['mask'].node, true, [new Color(0,0,0,0), new Color(0,0,0,255)]);
        door.paused = false;

        await Utils.delay(2000);
        this.properties['preload']['pDoor'].node.active = false;
        this.properties['preload']['lDoor'].node.active = false;

        this.jp(JP_TYPE.GRAND).ani.component.setAnimation(0, 'play03', false);
        this.jp(JP_TYPE.MAJOR).ani.component.setAnimation(0, 'play03', false);
        this.jp(JP_TYPE.MINOR).ani.component.setAnimation(0, 'play03', false);
        this.jp(JP_TYPE.MINI).ani.component.setAnimation(0, 'play03', false);
        this.play_pot_ani(0);
        this.loop_play_jp_ani();
    }

    public get doorSpine() : sp.Skeleton { return Viewport.Orientation === Orientation.PORTRAIT ? this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT] : this.properties['preload']['lDoor'][DATA_TYPE.COMPONENT]; }

    private TYPE_POT_LEVEL = { 0: 'default', 1: 'level1', 2: 'level2', 3: 'level3', 4: 'level4', };
    public async play_pot_ani(level:number) {
        this.JP_LEVEL = level;
        const spine : sp.Skeleton = this.jp(JP_TYPE.POT).ani.component;
        
        if ( level < 5 ) {
            await Utils.delay(1000);
            Utils.playSpine(spine, 'play04', false);
            await Utils.delay(1000);
            spine.setSkin(this.TYPE_POT_LEVEL[level]);
            return;
        }
        spine.setSkin(this.TYPE_POT_LEVEL[4]);
        await Utils.playSpine(spine, 'play03', false);
        return;
    }

    /**
     * 輪播發光動畫
     */
    private async loop_play_jp_ani() {
        const wait = Utils.Random(6000,8000) - (this.JP_LEVEL * 1000);
        await Utils.delay(wait);

        let alltypes = [JP_TYPE.GRAND, JP_TYPE.MAJOR, JP_TYPE.MINOR, JP_TYPE.MINI, JP_TYPE.POT];

        for(let i=this.JP_LEVEL;i>=0;i--) {
            let type = Utils.Random(0, alltypes.length);
            let jp = alltypes[type];
            let spine : sp.Skeleton = this.jp(jp)?.ani?.component;
            if ( spine == null ) continue;
            alltypes.splice(type, 1);

            if ( spine['isPlaying'] === true ) continue;
            Utils.playSpine(spine, 'play', false);
        }

        this.loop_play_jp_ani();
    }

    public changeTotalBet( totalBet: number ) {
        this.jp(JP_TYPE.GRAND).value.component.string = Utils.numberCommaM(totalBet * this.JP_REWARD[JP_TYPE.GRAND]);
        this.jp(JP_TYPE.MAJOR).value.component.string = Utils.numberCommaM(totalBet * this.JP_REWARD[JP_TYPE.MAJOR]);
        this.jp(JP_TYPE.MINOR).value.component.string = Utils.numberCommaM(totalBet * this.JP_REWARD[JP_TYPE.MINOR]);
        this.jp(JP_TYPE.MINI).value.component.string  = Utils.numberCommaM(totalBet * this.JP_REWARD[JP_TYPE.MINI]);
    }

    public isFreeGame = false;
    /**
     * 進入 Free Game 流程
     */
    public async trigger_free_game() {
        const triggerUI = this.properties['freeGame']['trigger_ui'].component;
        this.isFreeGame = true;

        // #regine 顯示 Free Game UI
        this.machine.controller.maskActive(true);
        triggerUI.node.active = true;
        Utils.commonFadeIn(triggerUI.node, false, [new Color(255,255,255,0),Color.WHITE], triggerUI);
        await Utils.playSpine(triggerUI, 'play', false);
        Utils.playSpine(triggerUI, 'play02', true);
        await Utils.delay(3000);
        Utils.commonFadeIn(triggerUI.node, true, [new Color(255,255,255,0),Color.WHITE], triggerUI);
        triggerUI.setAnimation(0, 'idle', false);
        // #endregine 顯示 Free Game UI

        // #regine 開關門
        await this.jpGame.open_door(()=>{
            this.machine.controller.maskActive(false);
            this.properties['background']['freeGame'].node.active = true;
        });
        await Utils.delay(1000);

        // 開始 Free Game
        await FreeGame.StartFreeGame(this.machine.spinData['sub_game']); // 等待 Free Game 結束
        await Utils.delay(1000);

        

        this.isFreeGame = false;
        return; // 回到 processWinningScore
        
    }
}

