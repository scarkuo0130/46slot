import { _decorator, Color, Label, Node, Sprite, sp, Vec3, tween, Button, EventTarget, Tween } from 'cc';
import { Utils, DATA_TYPE } from '../../sub_module/utils/Utils';
import { Symbol } from '../../sub_module/game/machine/Symbol';
import { Payway } from '../../sub_module/game/machine/pay/Payway';
import { Viewport, Orientation } from '../../sub_module/utils/Viewport';
import { ObjectPool } from '../../sub_module/game/ObjectPool';
import { JpGame4600 } from './jp_game/JpGame4600';
import { FreeGame } from '../../sub_module/game/FeatureGame/FreeGame';
import { OrientationNode } from '../../sub_module/develop/OrientationNode';
import { AutoSpin } from '../../sub_module/game/AutoSpin';
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

        'perform' : {
            'score_board' : { [DATA_TYPE.TYPE] : sp.Skeleton,   [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Reel/RewardWindow'  },
        },

        'freeGame' : {
            'main' : { [DATA_TYPE.TYPE] : Node,                 [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI'},
            'trigger_ui' : { [DATA_TYPE.TYPE] : sp.Skeleton,    [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/Trigger Game'},
            'start_ui'   : { [DATA_TYPE.TYPE] : sp.Skeleton,    [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/Start Game'},
            'start_ui_c' : { [DATA_TYPE.TYPE] : Node,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/Start Game/PressAnyWhereToContinue'},
            'end_ui'     : { [DATA_TYPE.TYPE] : sp.Skeleton,    [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/End Game'},
            'end_ui_c'   : { [DATA_TYPE.TYPE] : Node,           [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/End Game/PressAnyWhereToContinue'},
            'endTimes'   : { [DATA_TYPE.TYPE] : Label,          [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/End Game/Times'},
            'endTotalWin': { [DATA_TYPE.TYPE] : Label,          [DATA_TYPE.SCENE_PATH] : 'Canvas/Other UI/Free Game UI/End Game/Value'},
        },

        'background' : {
            'main' : { [DATA_TYPE.TYPE] : Node,                 [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Background/Main Background'},
            'freeGame' : { [DATA_TYPE.TYPE] : OrientationNode,  [DATA_TYPE.SCENE_PATH] : 'Canvas/Machine/Background/FG Background'},
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
        this.properties['freeGame']['start_ui'].node.setPosition(0, 0, 0);
        this.properties['freeGame']['end_ui'].node.setPosition(0, 0, 0);
        this.properties['background']['freeGame'].node.active = false;
        this.properties['freeGame']['start_ui_c'].node.active = false;
        this.properties['freeGame']['end_ui_c'].node.active = false;

        ObjectPool.registerNode('soul', this.properties['jp']['wild_soul'].node);
        this.properties['jp']['wild_soul'].node.active = false;

        this.doorSpine.node.active = true;
        Utils.playSpine(this.doorSpine, 'idle', false, 1, true);
    }
    // 給予專案 start 使用
    protected onstart() { 
        this.properties['freeGame']['trigger_ui'].node.active = false;
        this.properties['freeGame']['start_ui'].node.active = false;
        this.properties['freeGame']['end_ui'].node.active = false;
        this.JP_LEVEL = 0;
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
        const free_game : boolean = gameResult.free_spin_times > 0;

        this.machine.activeBuyFGButton(false);  // 關閉購買 Free Game 按鈕

        console.log('gameResult', free_game, gameResult);

        // 聚寶盆動畫，如果有JP遊戲，先進去玩
        await this.absorbWildSymbolIntoTreasurePot(free_game);
        
        if ( !free_game ) { // 假如沒有 free_game, 就回去報獎流程
            return super.processWinningScore();
        }

        // 進入JP遊戲
        console.log('進入free game遊戲');
        await Utils.delay(3000);
        await this.start_free_game();
    }

    /**
     * 播放全部獎項
     * @override 可覆寫
     * 顯示計分背板
     */
    protected async performAllPayline() {

        const { lines, pay_credit_total } = this.gameResult;
        if ( lines.length === 0 ) return;
        if ( pay_credit_total === 0 ) return;

        this.scoreBoard.node.active = true; // 顯示計分背板
        await Utils.commonFadeIn(this.scoreBoard.node, false, null, this.scoreBoard);
        this.scoreBoard.setAnimation(0, 'play', false);

        await super.performAllPayline();     // 播放全部獎項
        this.scoreBoard.node.active = false; // 關閉計分背板
    }
    
    /**
     * Wild Symbol 飛到聚寶盆動態
     * @param wild 
     */
    private async wildSoulFlyToPot( wild:Node ) {
        const symbol = wild.getComponent(Symbol);
        const spine = symbol.spine;
        spine.setAnimation(0, 'play02', false);
        await Utils.delay(300);

        const soul = ObjectPool.Get('soul');
        soul.setScale(2,2,1);
        soul.parent = this.machine.node;
        soul.worldPosition = wild.worldPosition;
        soul.active = true;
        const toPos = this.jp(JP_TYPE.POT).ani.node.worldPosition.clone();
        toPos.x += Utils.Random(-55, 55);
        toPos.y += Utils.Random(-55, 55);

        // let onFinished = ()=>{ Utils.delay(1000).then(()=>{ObjectPool.Put('soul', soul)}) };
        await Utils.tweenBezierCurve(soul, toPos, 1, null, true);
        tween(soul).to(0.5, {scale: new Vec3(0,0,0)}, {easing: 'smooth'}).start();
        Utils.delay(1000).then(()=>{ObjectPool.Put('soul', soul)}); // 回收
    }


    /**
     *  聚寶盆吸收 Wild Symbol動畫
     */
    private async absorbWildSymbolIntoTreasurePot(fullWait:boolean=false) {
        // 盤面是否有 Wild Symbol
        const wilds = this.reel.showWinSymbol(WildID);
        if (wilds.length === 0) return false;

        this.reel.closeNearMissMask();  // 關閉 NearMiss 遮罩

        // 錢幣飛行效果
        for(let i=0;i<wilds.length;i++) {
            this.wildSoulFlyToPot( wilds[i] );
            this.wildSoulFlyToPot( wilds[i] );
            this.wildSoulFlyToPot( wilds[i] );
        }

        // 等待動畫播完
        await Utils.delay(400);

        if ( this.gameResult?.jp_prize > 0 ) {    
            this.machine.featureGame = true;
            await Utils.delay(1000);
            const {jp_type, jp_prize} = this.gameResult;
            await this.jpGame.enter_jp_game(jp_type, jp_prize);
            this.gameResult.noLoop = true;
            return true;
        }

        this.reel.moveBackToWheel();
        if ( fullWait ) await this.play_pot_ani(false);
        else this.play_pot_ani(false);

        return true;
    }

    public async exit_jp_game() {
        this.reset_pot_ani();
        if ( this.isFreeGame ) return;
        this.machine.controller.buttonSpinning(false);
        this.machine.featureGame = false;
    }

    /**
     * 進入JP遊戲
     */
    private async enter_jp_game() {
        await this.play_pot_ani(true);

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
        this.play_pot_ani(false);
        this.loop_play_jp_ani();
    }

    public get doorSpine() : sp.Skeleton { return Viewport.Orientation === Orientation.PORTRAIT ? this.properties['preload']['pDoor'][DATA_TYPE.COMPONENT] : this.properties['preload']['lDoor'][DATA_TYPE.COMPONENT]; }

    private TYPE_POT_LEVEL = { 0: 'default', 1: 'level1', 2: 'level2', 3: 'level3', 4: 'level4', };
    public async play_pot_ani(open:boolean=false) {
        // if ( level == null ) level = 1;
        this.JP_LEVEL ++;
        if ( this.JP_LEVEL > 4 ) this.JP_LEVEL = 4;

        const level = this.JP_LEVEL;
        const spine : sp.Skeleton = this.jp(JP_TYPE.POT).ani.component;
        if ( open === false ) {
            await Utils.delay(1000);
            Utils.playSpine(spine, 'play04', false);
            await Utils.delay(1000);
            spine.setSkin(this.TYPE_POT_LEVEL[level]);
            return;
        }

        spine.setSkin(this.TYPE_POT_LEVEL[level]);
        await Utils.playSpine(spine, 'play03', false);
        return;
    }

    public async reset_pot_ani() {
        this.JP_LEVEL = 0;
        const level = this.JP_LEVEL;
        const spine : sp.Skeleton = this.jp(JP_TYPE.POT).ani.component;
        spine.setSkin(this.TYPE_POT_LEVEL[level]);
        Utils.playSpine(spine, 'play04', false);

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

    // 進入 Free Game 前的原始局
    public firstGameResult:any = null;

    /**
     * 進入 Free Game 流程
     */
    public async start_free_game() {

        // this.machine.activeBuyFGButton(false);  // 關閉購買 Free Game 按鈕
        await this.trigger_free_game_ui();

        if ( this.isFreeGame ) return;          // 如果已經在 Free Game 中，不用做任何事，回到 FreeGame
        this.firstGameResult = this.gameResult;  // 保存原始局
        this.machine.featureGame = true;
        this.isFreeGame = true;
        const sub_game = this.machine.spinData['sub_game'];
        
        let freeGameTimes = this.gameResult.free_spin_times;
        AutoSpin.AutoSpinTimes(freeGameTimes); // 打開 Spin 次數

        // 開始 Free Game
        await FreeGame.StartFreeGame(   // 等待 Free Game 結束
            sub_game['result'],         // 每一局的內容
            async (roundData:any) => {  // 每一輪的callBack, 可await
                if ( roundData.free_spin_times > 0 ) {
                    freeGameTimes += roundData.free_spin_times;
                }
                freeGameTimes --;
                AutoSpin.AutoSpinTimes(freeGameTimes)
                await Utils.delay(1000);
                
            }
        ); 

        // Free Game 已經結束
        await Utils.delay(1000); // 發呆一下
        await this.end_free_game_ui(sub_game); // 結束 Free Game UI
        AutoSpin.CloseAutoSpinTimes();         // 關掉Spin次數

        this.isFreeGame = false;
        this.machine.featureGame = false;
        // this.machine.activeBuyFGButton(false);  // 打開購買 Free Game 按鈕
        return; // 回到正常遊戲 processWinningScore
        
    }

    // 觸發 Free Game UI
    public async trigger_free_game_ui() {

        this.reel.closeNearMissMask();
        this.machine.controller.maskActive(true);

        if ( this.isFreeGame ) { // 如果已經在 Free Game 中，顯示觸發 UI
            const triggerUI = this.properties['freeGame']['trigger_ui'].component;
            triggerUI.node.active = true;
            Utils.commonFadeIn(triggerUI.node, false, [new Color(255,255,255,0),Color.WHITE], triggerUI);
            await Utils.playSpine(triggerUI, 'play', false);
            Utils.playSpine(triggerUI, 'play02', true);
            await Utils.delay(3000);
            Utils.commonFadeIn(triggerUI.node, true, [new Color(255,255,255,0),Color.WHITE], triggerUI);
            triggerUI.setAnimation(0, 'idle', false);
            this.machine.controller.maskActive(false);
            await Utils.delay(500);
            await this.performAllPayline(); // 因為 Scatter 有分數，所以要播放一次

        } else { // 如果不在 Free Game 中，直接進入 Free Game UI
            const startUI = this.properties['freeGame']['start_ui'].component;
            let clickEvent = new EventTarget();
            startUI.node.active = true;

            Utils.commonFadeIn(startUI.node, false, [new Color(255,255,255,0),Color.WHITE], startUI);
            await Utils.commonActiveUITween(startUI.node, true);

            if ( AutoSpin.IsUtilFeature() ) { // 如果有 AutoSpin, UtilFeature, 要等玩家點擊
                await Utils.delay(1000);      // 等待一秒
                this.properties['freeGame']['start_ui_c'].node.active = true; // 顯示點擊螢幕提示
                startUI.node.on(Node.EventType.TOUCH_END, ()=> {  clickEvent.emit('done');  });
                await Utils.delayEvent(clickEvent); // 等待玩家點擊螢幕
                this.properties['freeGame']['start_ui_c'].node.active = false;
                startUI.node.off(Node.EventType.TOUCH_END);

            } else {
                await Utils.delay(3000);     // 等待三秒
            }
            
            startUI.node.off(Node.EventType.TOUCH_END);

            Utils.commonFadeIn(startUI.node, true, [new Color(255,255,255,0),Color.WHITE], startUI);
            await Utils.commonActiveUITween(startUI.node, false); // 關閉 UI
            await this.jpGame.open_door(()=> { // 關門轉場 
                this.machine.controller.maskActive(false);
                this.properties['background']['freeGame'].node.active = true;
                this.properties['background']['freeGame'].component.changeOrientation();
                this.reel.closeNearMissMask();
            });
        }
    }

    /**
     * 結束 Free Game UI
     */
    public async end_free_game_ui(subGameData:any) {
        const endUI = this.properties['freeGame']['end_ui'].component;
        const [ times, total_win ] = [ subGameData['result'].length, subGameData['pay_credit_total'] ];
        const [ timesLabel, totalWinLabel ] = [
            this.properties['freeGame']['endTimes'].component,
            this.properties['freeGame']['endTotalWin'].component,
        ];
        timesLabel.string = '';
        totalWinLabel.string = '';

        this.reel.closeNearMissMask();
        this.machine.controller.maskActive(true);
        // 打開結束 UI
        Utils.commonFadeIn(endUI.node, false, [new Color(255,255,255,0),Color.WHITE], endUI); 
        await Utils.commonActiveUITween(endUI.node, true);
        
        timesLabel.string = subGameData['result'].length; // 顯示次數

        // 滾動總得分
        let clickEvent = new EventTarget();

        // 開始滾分, 十秒
        let waiting = await Utils.commonTweenNumber(totalWinLabel, 0, total_win, 5, null, clickEvent);
        waiting['time'] = Date.now();

        // 打開按鈕
        endUI.node.on(Node.EventType.TOUCH_END, async ()=> {
            // 如果 tween 還沒結束，就直接結束
            let tween = waiting.tween;
            if ( tween == null ) return clickEvent.emit('done');
            if ( tween.isDone === true ) return clickEvent.emit('done');

            // 還在滾分
            let lastTime = Date.now() - waiting['time'];
            
            // 剩下不到一秒，不理他，等自然結束
            if ( lastTime < 1000 ) return;

            // 停止滾分
            tween.stop();

            // 剩餘分數，一秒內滾完
            const last = waiting.data.value;
            await Utils.commonTweenNumber(totalWinLabel, last, total_win, 1);
            clickEvent.emit('done');
        });

        await Utils.delayEvent(clickEvent);       // 等待滾完
        endUI.node.off(Node.EventType.TOUCH_END); // 移除滾分點擊

        // 最後放大數字效果
        await Utils.delay(500);
        await Utils.scaleFade(totalWinLabel);
        
        clickEvent.removeAll('done');             // 移除滾分事件

        if (  AutoSpin.IsUtilFeature() === true ) {                                    // 如果有 AutoSpin, UtilFeature, 要等玩家點擊
            endUI.node.on(Node.EventType.TOUCH_END, ()=> { clickEvent.emit('done')}); // 增加關閉事件
            this.properties['freeGame']['end_ui_c'].node.active = true;               // 顯示點擊螢幕提示
            await Utils.delayEvent(clickEvent);                                       // 等待玩家 click
            endUI.node.off(Node.EventType.TOUCH_END);
        } else {
            await Utils.delay(2000);     // 等待三秒
        }

        // 關閉介面
        Utils.commonFadeIn(endUI.node, true, [new Color(255,255,255,0),Color.WHITE], endUI, 0.3);
        await Utils.commonActiveUITween(endUI.node, false);
        
        let endEvent = new EventTarget();
        await this.jpGame.open_door(async ()=> { // 關門轉場 
            this.machine.controller.maskActive(false);
            this.properties['background']['freeGame'].node.active = false;
            // 換回原本盤面
            this.restoreGameResult(this.firstGameResult);
            await Utils.delay(500);
            endEvent.emit('done');
        });
        endEvent = null;
        await Utils.delayEvent(endEvent);
        await this.performAllPayline(); // 因為 Scatter 有分數，所以要播放一次

    }

    /** 計算 NearMiss 位置 
     * 4600 特殊規則, Wild 與 Scatter 都可以進 FreeGame
     * 1.從左到右，相同的圖騰依序3連以上即可獲獎
     * 2.Scatter有賠倍，從左到右，3個以上即可獲獎，進入FG也需要從左到右
     * 3.旋轉到 3 個Scatter，進入 Free Game 時給予 10 次Free Spin
     * 4.Wild可取代所有圖騰(包刮Scatter)
    */
    public getNearMissIndex(reel_result) : number {
        if ( this.machine.reel.nearMissSymbolData == null ) return -1;
        if ( this.machine.reel.nearMissSymbolData.length === 0 ) return -1;
        const nearMissSymbols = this.machine.reel.nearMissSymbolData;

        // 第一輪沒有 Scatter
        if ( reel_result[0].includes(12) === false ) return -1;

        // 把 Wild 與 Scatter 合併計算
        let reelCount = this.mergeReckonSymbolReelCount([12,0], reel_result);

        // 第二輪沒有 Scatter 或 Wild
        if ( reelCount[1] === 0 ) return -1;
        
        return 1;
    }

    // 連續三個 Scatter 才有 Free Game, 不是第三輪就不用做了
    public nearMissWheel(wheelID:number) : boolean { 
        if ( wheelID != 2 ) {
            if ( wheelID === 4 ) { // 關掉前幾輪的聽牌
                this.reel.getWheels()[0].nearMissMask(false);
                this.reel.getWheels()[1].nearMissMask(false);
                this.reel.getWheels()[2].nearMissMask(false);
            }
            return false;
        }
        return true; 
    }

    // 敲鑼的動態什麼時候做
    // 有聽牌機會在做
    public showDropSymbol(wheelID:number, symbol:Symbol) : boolean {

        if ( wheelID > 2 ) return false;                                   // 第3輪之後不用做
        if ( wheelID === 0 ) return true;                                  // 第一排一定要做
        if ( wheelID > 0 && this.reel.nearMiss === 1 ) {                   // 第二排 但沒有聽牌不用做
            return true; 
        }
        return false;
    }

}

