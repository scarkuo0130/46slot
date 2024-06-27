import { _decorator, Color, Component, Node, Sprite, sp, Vec3, tween, Button, ParticleSystem2D } from 'cc';
import { Paytable } from '../../sub_module/game/machine/pay/PayTable';
import { Utils, DATA_TYPE, TWEEN_EASING_TYPE } from '../../sub_module/utils/Utils';
import { Symbol } from '../../sub_module/game/machine/Symbol';
import { Machine } from '../../sub_module/game/machine/Machine';
import { Payway } from '../../sub_module/game/machine/pay/Payway';
import { Viewport, Orientation } from '../../sub_module/utils/Viewport';
import { ObjectPool } from '../../sub_module/game/ObjectPool';
const { ccclass, property } = _decorator;

export enum JP_TYPE {
    GRAND = 0,
    MAJOR = 1,
    MINOR = 2,
    MINI = 3,
    POT = 4,
}

export var WildID = 0;

@ccclass('Payway4600')
export class Payway4600 extends Payway {

    public jp(type:number) { return this.properties['jp'][type]; }

    private readonly onloadData = {
        'preload' : {
            'mask'     : { [DATA_TYPE.TYPE] : Sprite,        [DATA_TYPE.SCENE_PATH] : 'Canvas/PreLoad/Mask'  },
            'pDoor'    : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/PreLoad/Portrait/door'  },
            'lDoor'    : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/PreLoad/Landscape/door'  },
        },
    
        'jp' : {
            'grand_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Grand'  },
            'major_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Major'  },
            'minor_ani' : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Minor'  },
            'mini_ani'  : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/JP Mini'  },
            'pot_ani'   : { [DATA_TYPE.TYPE] : sp.Skeleton,     [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Treasure Pot'  },
            'wild_soul' : { [DATA_TYPE.TYPE] : Node,            [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/Wild Soul'  },
        },

        'buyFeature' : {
            'button'  : { [DATA_TYPE.TYPE] : Button,            [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Buy Feature Game'  },
        },

        'perform' : {
            'score_board' : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Reel/RewardWindow'  },
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
        this.properties['jp'][JP_TYPE.GRAND] = { 'ani' : this.properties['jp']['grand_ani'] };
        this.properties['jp'][JP_TYPE.MAJOR] = { 'ani' : this.properties['jp']['major_ani'] };
        this.properties['jp'][JP_TYPE.MINOR] = { 'ani' : this.properties['jp']['minor_ani'] };
        this.properties['jp'][JP_TYPE.MINI]  = { 'ani' : this.properties['jp']['mini_ani'] };
        this.properties['jp'][JP_TYPE.POT]   = { 'ani' : this.properties['jp']['pot_ani'] };

        ObjectPool.registerNode('soul', this.properties['jp']['wild_soul'].node);
        this.properties['jp']['wild_soul'].node.active = false;

    }
    // 給予專案 start 使用
    protected onstart() { 
        this.machine.controller.addDisableButtons(this.properties['buyFeature']['button'].component);
        Utils.AddHandHoverEvent(this.properties['buyFeature']['button'].node);
        this.scoreBoard.node.active = false;
        console.log(this);
        this.preload_open_door();       // 開門動畫
        return; 
    }

    // 顯示分數的背板
    protected get scoreBoard() : sp.Skeleton { return this.properties['perform']['score_board'].component; }

    /**
     * 進入報獎流程
     * @override 可覆寫
     */
    private async processWinningScore() {
        await this.absorbWildSymbolIntoTreasurePot();
        // 回到原本流程 
        return super.processWinningScore();
    }

    /**
     * 播放全部獎項
     */
    protected async performAllPayline() {
        this.scoreBoard.node.active = true;
        await Utils.commonFadeIn(this.scoreBoard.node, false, null, this.scoreBoard);
        this.scoreBoard.setAnimation(0, 'play', false);
        // await Utils.commonFadeIn(this.scoreBoard.node, false, null, this.scoreBoard);
        await super.performAllPayline();
        this.scoreBoard.node.active = false;
        // await Utils.commonFadeIn(this.scoreBoard.node, true, null, this.scoreBoard);
    }

    /**
     *  聚寶盆吸收 Wild Symbol動畫
     */
    private async absorbWildSymbolIntoTreasurePot() {
        // 盤面是否有 Wild Symbol
        const wilds = this.reel.showWinSymbol(WildID);
        if (wilds.length === 0) return;

        console.log('absorbWildSymbolIntoTreasurePot', wilds.length);
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
        await Utils.delay(1000);
        this.reel.moveBackToWheel();

        /// 沒有得分, 關閉遮罩
        // if ( this.gameResult?.pay_credit_total === 0 ) this.reelMaskActive(false);
        
    }


    /** 開場動畫 */
    private async preload_open_door() {
        const orientation = Viewport.Orientation;
        const door : sp.Skeleton = orientation === Orientation.PORTRAIT ? this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT] : this.properties['preload']['lDoor'][DATA_TYPE.COMPONENT];

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
        this.play_pot_ani(1);
        this.loop_play_jp_ani();
    }

    private TYPE_POT_LEVEL = { 0: 'default', 1: 'level1', 2: 'level2', 3: 'level3', 4: 'level4'};
    private async play_pot_ani(level:number) {
        const skeleton : sp.Skeleton = this.jp(JP_TYPE.POT).ani.component;
        let from = level - 1;
        if ( from < 0 ) from = 4;
        skeleton.setSkin(this.TYPE_POT_LEVEL[from]);
        skeleton.setAnimation(0, 'play03', false);
        await Utils.delay(1200);
        skeleton.setSkin(this.TYPE_POT_LEVEL[level]);
        skeleton.setAnimation(0, 'play02', false);
    }

    /**
     * 輪播發光動畫
     */
    private async loop_play_jp_ani() {
        await Utils.delay(Utils.Random(3000,6000));
        let type = Utils.Random(JP_TYPE.GRAND, JP_TYPE.POT);
        this.jp(type).ani.component.setAnimation(0, 'play', false);

        this.loop_play_jp_ani();
    }


}

