import { _decorator, Color, Component, Node, Sprite, sp, Vec3, tween, Button, ParticleSystem2D } from 'cc';
import { Paytable } from '../../sub_module/game/machine/pay/PayTable';
import { Utils, DATA_TYPE } from '../../sub_module/utils/Utils';
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
            'wild_soul' : { [DATA_TYPE.TYPE] : ParticleSystem2D,[DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Items/Wild Soul'  },
        },

        'buyFeature' : {
            'button'  : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Buy Feature Game'  },
        }
    };

    protected onload() { 
        Utils.initData(this.onloadData, this);
        this.properties['preload']['mask'].node.active = true;
        this.properties['preload']['pDoor'].node.active = true;
        this.properties['preload']['lDoor'].node.active = true;
        this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT].setAnimation(0, 'idle', false);
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
        console.log(this);
        this.preload_open_door();       // 開門動畫
        return; 
    }

    /**
     * 進入報獎流程
     * @override 可覆寫
     */
    private async processWinningScore() {
        await this.absorbWildSymbolIntoTreasurePot();
        // 回到原本流程 
        return super.processWinningScore();
    }

    private async absorbWildSymbolIntoTreasurePot() {
        // 盤面是否有 Wild Symbol
        const wilds = this.reel.showWinSymbol(WildID);
        if (wilds.length === 0) return;

        let self = this;
        // 打開遮罩
        // this.reelMaskActive(true);
        wilds.forEach( async (wild) => {
            const symbol = wild.getComponent(Symbol);
            const spine = symbol.spine;
            spine.setAnimation(0, 'play02', false);
            await Utils.delay(300);

            const soul = ObjectPool.Get('soul');
            soul.parent = self.reel.showWinContainer;
            soul.worldPosition = wild.worldPosition;
            soul.active = true;
            const toPos = self.jp(JP_TYPE.POT).ani.node.worldPosition;
            
            tween(soul).to(0.3, { worldPosition: toPos }, { onComplete:(s:Node)=> {ObjectPool.Put('soul', s);} }).start();
        });

        // 等待動畫播完
        await Utils.delay(1000);
        this.reel.moveBackToWheel();
        this.jp(JP_TYPE.POT).ani.component.setAnimation(0, 'play', false);

        /// 沒有得分, 關閉遮罩
        // if ( this.gameResult?.pay_credit_total === 0 ) this.reelMaskActive(false);
        
    }


    /** 開場動畫 */
    private async preload_open_door() {
        const orientation = Viewport.Orientation;
        await Utils.commonFadeIn(this.properties['preload']['mask'].node, true, [new Color(0,0,0,0), new Color(0,0,0,255)]);
        
        if ( Orientation.PORTRAIT === orientation ) {
            // this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT].setAnimation(0, 'play02', false);
        } else {
            // this.properties['preload']['lDoor'][DATA_TYPE.COMPONENT].setAnimation(0, 'play02', false);
        }
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
     * 輪播 JP 發光動態
     */
    private async loop_play_jp_ani() {
        await Utils.delay(Utils.Random(5000,10000));
        let type = Utils.Random(0,3);
        this.jp(type).ani.component.setAnimation(0, 'play', false);

        this.loop_play_jp_ani();
    }


}

