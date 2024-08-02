import { _decorator, Component, Label, sp, Sprite, EventTarget, tween, Vec3, Color, System, Tween, ParticleSystem, Node} from 'cc';
import { Utils, DATA_TYPE, _utilsDecorator } from '../../utils/Utils';
import { Machine } from './Machine';
import { gameInformation } from '../GameInformation';
const { isDevelopFunction } = _utilsDecorator;

const { ccclass, property } = _decorator;

@ccclass('BigWin')
export class BigWin extends Component {

    public static readonly BIGWIN_TYPE = {
        NONE        : 0,
        BIG_WIN     : 1,
        SUPER_WIN   : 2,
        MEGA_WIN    : 3,
        length      : 4,
    };

    /** 播放動畫名稱 */
    public readonly ANIMATION_TYPE = {
        START      : 'in',
        LOOP       : 'loop',
        END        : 'out',
    };

    /** 預設播放秒數  */
    public readonly durationMap = {
        [BigWin.BIGWIN_TYPE.BIG_WIN]   : 4000,
        [BigWin.BIGWIN_TYPE.SUPER_WIN] : 4000,
        [BigWin.BIGWIN_TYPE.MEGA_WIN]  : 4000,
        'QuickEnd'                     : 1000,
    }

    private InitData = {
        [BigWin.BIGWIN_TYPE.BIG_WIN] : {
            'node'  : { [DATA_TYPE.TYPE]:Sprite, [DATA_TYPE.NODE_PATH]:'BigWin' },
            'spine' : { [DATA_TYPE.TYPE]:sp.Skeleton, [DATA_TYPE.NODE_PATH]:'BigWin/Spine' },
            'particle' : { [DATA_TYPE.TYPE]:Node, [DATA_TYPE.NODE_PATH]:'BigWin/Particle' },
        },

        [BigWin.BIGWIN_TYPE.SUPER_WIN] : {
            'node'  : { [DATA_TYPE.TYPE]:Sprite, [DATA_TYPE.NODE_PATH]:'SuperWin' },
            'spine' : { [DATA_TYPE.TYPE]:sp.Skeleton, [DATA_TYPE.NODE_PATH]:'SuperWin/Spine' },
            'particle' : { [DATA_TYPE.TYPE]:Node, [DATA_TYPE.NODE_PATH]:'SuperWin/Particle' },
        },

        [BigWin.BIGWIN_TYPE.MEGA_WIN] : {
            'node'  : { [DATA_TYPE.TYPE]:Sprite, [DATA_TYPE.NODE_PATH]:'MegaWin' },
            'spine' : { [DATA_TYPE.TYPE]:sp.Skeleton, [DATA_TYPE.NODE_PATH]:'MegaWin/Spine' },
            'particle' : { [DATA_TYPE.TYPE]:Node, [DATA_TYPE.NODE_PATH]:'MegaWin/Particle' },
        },

        'value': {
            'label' : { [DATA_TYPE.TYPE]:Label, [DATA_TYPE.NODE_PATH]:'Score/Value' },
            'show'  : { [DATA_TYPE.TYPE]:Label, [DATA_TYPE.NODE_PATH]:'Score/Show' },
            'board' : { [DATA_TYPE.TYPE]:Sprite, [DATA_TYPE.NODE_PATH]:'Score/Board' },
        },
    };

    private properties = {
        'playing' : BigWin.BIGWIN_TYPE.NONE, // 正在播放的動畫
        'event'   : null,
        'tween'   : null,
        'lastType': BigWin.BIGWIN_TYPE.NONE,
        'playValue' : [0, 0, 0, 0],
        'score'   : 0,
        'quickStop' : false,
    };

    private get quickStop() : boolean { return this.properties['quickStop']; }
    private set quickStop(value:boolean) { this.properties['quickStop'] = value; }

    public static Instance : BigWin;

    private activeParticle(active:boolean) {
        const playing = this.playing;
        const particles = this.properties[playing].particles;
        if ( !particles ) return;

        if ( active === true ) particles.forEach((particle)=>{ particle.play(); });
        else particles.forEach((particle)=>{ particle.stop(); });
    }


    protected onLoad(): void {
        BigWin.Instance = this;
        this.node.setPosition(0, 0, 0);
        Utils.initData(this.InitData, this);

        this.spine(BigWin.BIGWIN_TYPE.BIG_WIN).node.active = false;
        this.spine(BigWin.BIGWIN_TYPE.SUPER_WIN).node.active = false;
        this.spine(BigWin.BIGWIN_TYPE.MEGA_WIN).node.active = false;
        this.valueBoard.node.active = false;
        this.label.string = '';
        this.properties['value']['show'][DATA_TYPE.COMPONENT].string = '';
        this.properties['event'] = new EventTarget();

        this.properties[BigWin.BIGWIN_TYPE.BIG_WIN].particles   = this.properties[BigWin.BIGWIN_TYPE.BIG_WIN]['particle'].node.getComponentsInChildren(ParticleSystem);
        this.properties[BigWin.BIGWIN_TYPE.SUPER_WIN].particles = this.properties[BigWin.BIGWIN_TYPE.SUPER_WIN]['particle'].node.getComponentsInChildren(ParticleSystem);
        this.properties[BigWin.BIGWIN_TYPE.MEGA_WIN].particles  = this.properties[BigWin.BIGWIN_TYPE.MEGA_WIN]['particle'].node.getComponentsInChildren(ParticleSystem);
        this.spine(BigWin.BIGWIN_TYPE.BIG_WIN).node.on('click', ()=>{ this.quickEnd(); });
        this.spine(BigWin.BIGWIN_TYPE.SUPER_WIN).node.on('click', ()=>{ this.quickEnd(); });
        this.spine(BigWin.BIGWIN_TYPE.MEGA_WIN).node.on('click', ()=>{ this.quickEnd(); });
        Utils.AddHandHoverEvent(this.spine(BigWin.BIGWIN_TYPE.BIG_WIN).node);
        Utils.AddHandHoverEvent(this.spine(BigWin.BIGWIN_TYPE.SUPER_WIN).node);
        Utils.AddHandHoverEvent(this.spine(BigWin.BIGWIN_TYPE.MEGA_WIN).node);
        this.node.active = false;
    }

    /** 取得spine */
    public spine(type:number) : sp.Skeleton {
        if ( !this.InitData[type] ) return null;
        return this.InitData[type]['spine'][DATA_TYPE.COMPONENT];
    }

    public get machine() { return Machine.Instance; }

    public get event() :EventTarget { return this.properties['event']; }

    public get playing () : number { return this.properties['playing']; }
    public set playing (value:number) { this.properties['playing'] = value; }

    /** 取得Label */
    public get label() : Label { return this.InitData['value']['label'][DATA_TYPE.COMPONENT]; }

    public get score() { return this.properties['score']; }
    public set score(value:number) { 
        this.properties['score'] = value;
        this.label.string = Utils.numberComma(value); 
    }
    public get playingSprite() { 
        if ( this.playing === BigWin.BIGWIN_TYPE.NONE ) return null;
        return this.properties[this.playing]['node'].component; 
    }

    public get lastType() { return this.properties['lastType']; }
    public set lastType(value:number) { this.properties['lastType'] = value; }

    public get playValue() { return this.properties['playValue']; }
    public set playValue(value:number[]) { this.properties['playValue'] = value; }

    public get valueBoard() { return this.properties['value']['board'][DATA_TYPE.COMPONENT]; }

    // public async waitingBigWin() { await Utils.delayEvent(this.event, 'done'); }

    public async play(type:number, quick:boolean=false) {
        if ( type === this.playing ) return;
        // 如果正在播放中，則中斷播放
        if ( this.playing !== BigWin.BIGWIN_TYPE.NONE ) await this.break();
        
        this.playing = type;
        this.playingSprite.node.active = true;
        this.activeParticle(true);

        let spine = this.spine(type);
        spine.node.active = true;

        if ( quick ) { // 不播放開啟動畫，直接 loop
            spine.setAnimation(0, this.ANIMATION_TYPE.LOOP, true);
            spine.setCompleteListener((track)=>{});
           
        } else {      // 播放開啟動畫，接著 loop
            Utils.playSpine(spine, this.ANIMATION_TYPE.START).then(()=>{  spine.setAnimation(0, this.ANIMATION_TYPE.LOOP, true); });
        }

        await Utils.commonFadeIn(this.playingSprite.node, false, null, this.playingSprite, 0.2);
    }

    /** 中斷播放 */
    public async break() : Promise<boolean> {
        const playing = this.playing;
        if ( playing === BigWin.BIGWIN_TYPE.NONE ) return false;
        
        this.activeParticle(false);
        await Utils.commonFadeIn(this.playingSprite.node, true, null, this.playingSprite);
        this.spine(playing).node.active = false;
        if (this.playingSprite != null) this.playingSprite.node.active = false;
        this.playing = BigWin.BIGWIN_TYPE.NONE;
        return true;
    }

    public async showValue() {
        let showLabel = this.properties['value']['show'][DATA_TYPE.COMPONENT];
        showLabel.string = this.label.string;
        showLabel.node.scale = Vec3.ONE;
        showLabel.node.active = true;
        showLabel.color = Color.WHITE;
        await Utils.delay(500);

        tween(showLabel.node).to(1, { scale: new Vec3(3.5, 3.5, 1) }).start();
        await Utils.commonFadeIn(showLabel.node, true, [new Color(255,255,255,0), new Color(255,255,255,90)], showLabel, 1);
        await Utils.delay(1000);
        showLabel.string = '';
    }

    /** 結束播放 */
    public async end() {
        if ( this.properties['ending'] === true ) return;
        this.properties['ending'] = true;

        this.label.string = '';
        await Utils.commonFadeIn(this.valueBoard.node, true, null, this.valueBoard, 0.2);
        await this.machine.controller.maskActive(false);
        this.node.active = false; 
        this.properties['ending'] = false;
    }

    public async FadeOutBreak() {
        if ( this.playing === BigWin.BIGWIN_TYPE.NONE ) return;
        this.activeParticle(false);
        await Utils.commonFadeIn(this.playingSprite.node, true, null, this.playingSprite, 1);
        await this.break(); 
    }

    /** 快速結束 */
    public async quickEnd() {
        if ( this.quickStop === true ) return;
        
        const playing = this.playing;
        const lastType = this.lastType;
        const event = this.event;

        if ( playing === lastType ) {
            const endTime = event['endTime'];
            const lastTime = endTime - Date.now();
            if ( lastTime < 500 ) return; // 剩下0.5秒內跑完，就不理會
        }

        this.quickStop = true;
        Utils.GoogleTag('QuickEnd', {'event_category':'BigWin', 'event_label':'QuickEnd', 'value':this.playing });
    }

    public bigWinLabel() { return gameInformation._winLevelRate; }

    @isDevelopFunction(true)
    public setBigWinLabel(vBig, vSuper, vMega) { 
        gameInformation._winLevelRate['BIG_WIN'] = vBig;
        gameInformation._winLevelRate['SUPER_WIN'] = vSuper;
        gameInformation._winLevelRate['MEGA_WIN'] = vMega;

        return this.bigWinLabel();
    }

    public isBigWin(totalWin:number=0) : number {

        if (totalWin === 0) return BigWin.BIGWIN_TYPE.NONE;
        let totalBet = this.machine.totalBet;

        if ( totalBet === 0 ) return BigWin.BIGWIN_TYPE.NONE;
        let winLevelRate = gameInformation._winLevelRate;

        let several = totalWin / totalBet;
        if ( several < winLevelRate['BIG_WIN'] )  return BigWin.BIGWIN_TYPE.NONE;
        if ( several > winLevelRate['MEGA_WIN'])  return BigWin.BIGWIN_TYPE.MEGA_WIN;
        if ( several > winLevelRate['SUPER_WIN']) return BigWin.BIGWIN_TYPE.SUPER_WIN;

        return BigWin.BIGWIN_TYPE.BIG_WIN;
    }

    /**
     * 播放BigWin的主要流程
     * @param totalWin { number } 總贏分
     */
    public async playBigWin(totalWin:number) {
        if ( this.node.active === true ) return;
        let lastType = this.isBigWin(totalWin);
        if ( lastType === BigWin.BIGWIN_TYPE.NONE ) return;

        let totalBet        = this.machine.totalBet;
        let winLevelRate    = gameInformation._winLevelRate;
        let playValue       = [ 0, totalBet * winLevelRate["BIG_WIN"], totalBet * winLevelRate["SUPER_WIN"], totalBet * winLevelRate["MEGA_WIN"]];
        let event           = this.event;
        let type            = BigWin.BIGWIN_TYPE.BIG_WIN;
        
        playValue[lastType] = totalWin;
        this.playValue      = playValue;
        this.lastType       = lastType;
        this.quickStop      = false;
        event.removeAll('done');

        this.node.active = true;
        await this.machine.controller.maskActive(true);
        Utils.commonFadeIn(this.valueBoard.node, false, null, this.valueBoard, 0.2);
        Utils.GoogleTag('BigWin', {'event_category':'BigWin', 'event_label':'BigWin', 'value':lastType });
        while(true) {
            if ( type === BigWin.BIGWIN_TYPE.BIG_WIN ) await this.play(type);
            else this.play(type);

            await this.tweenScore(this.durationMap[type], playValue[type-1], playValue[type], (type === lastType));
            if ( this.quickStop ) {
                await this.quickStopAsync();
                break;
            }

            
            if ( (type === lastType) ) break;
            this.break();
            type++;
        }
        await this.showValue();
        await this.break();
        await this.end(); // 結束
    }

    public async tweenScore(duration:number, from:number, finishValue:number, isFinish:boolean=false, isQuickTween:boolean=false) {
        let data          = { value:from };
        const playSec     = duration / 1000;
        const event       = this.event;
        const playing     = this.playing;
        const self        = this;
        const startTime   = Date.now();
        const endTime     = startTime + duration;
        event['endTime']  = endTime;
        this.score        = from;
        event.removeAll('done');

        const onComplete = (target)=> {             // 結束事件
            event.emit('done'); 
        }

        const onUpdate = (target)=> {               // 更新分數事件
            this.score = data.value; 
            if ( self.quickStop === false ) return; // 快停判斷
            if ( isQuickTween === true ) return;    // 快速停止
            tScore.stop();
            onComplete(target);
        }

        let tScore = tween(data).to(playSec,{ value:finishValue }, {
            onUpdate    : onUpdate,
            onComplete  : onComplete,
        }).start();

        await Utils.delayEvent(event, 'done');
        /*
        if ( isFinish && (this.quickStop === false || isQuickTween === true ) ) {
            await this.showValue();
        }*/

        tScore = null;
    }

    /**
     * 快速停止流程
     */
    public async quickStopAsync() {
        const playing = this.playing;
        const lastType = this.lastType;
        const playValue = this.playValue;
        const from = Math.floor(this.score);
        const to = playValue[lastType];

        if ( playing !== lastType ) {        // 不同動畫
            this.break();                    // 中斷目前的動畫
            await this.play(lastType, true); // 換最後一個動畫
        }

        await this.tweenScore(500, from, to, true, true); // 0.5秒內跑完
    }

}

