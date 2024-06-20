import { _decorator, Component, tween, sp, Color, Label, EventHandler, Vec3, AudioSource, AudioClip } from 'cc';
import { gameInformation } from '../GameInformation';
import { Utils } from '../../utils/Utils';
import { SimpleAudioClipData, SoundManager } from './SoundManager';
import { SpineRepeatTool } from '../../utils/SpineRepeatTool';
import { Machine } from './Machine';
const { ccclass, property } = _decorator;

export enum BIGWIN_TYPE {
    NONE = 0,
    BIG_WIN = 1,
    SUPER_WIN = 2,
    MEGA_WIN = 3,
}

@ccclass('BigWin')
export class BigWin extends Component {
    @property({ type: sp.Skeleton, displayName:'BigWinSpine', group:{name:'setting', id:'0'}})
    public bigWibSpine : sp.Skeleton;

    @property({ type:Label, displayName:'NumberLabel', group:{name:'setting', id:'0'}})
    public numberLabel : Label;

    @property({ type:sp.Skeleton, displayName:'CrazyCashDropSpin', group:{name:'setting', id:'0'}})
    public crazyCashDropSpin : sp.Skeleton;

    @property({ type:sp.Skeleton, displayName:'CoinSpin', group:{name:'setting', id:'0'}})
    public coinSpine : sp.Skeleton;

    @property({ type:sp.Skeleton, displayName:'JackpotSpine', group:{name:'setting', id:'0'}})
    public jackptSpine : sp.Skeleton;

    @property({ type:sp.Skeleton, displayName:'TournamentSpin', group:{name:'setting', id:'0'}})
    public tournamentSpin : sp.Skeleton;

    @property({type:AudioSource, displayName:'SoundSource', group:{name:'setting', id:'0'}})
    public audioSource: AudioSource;

    @property({type:AudioClip, displayName:'EndWinBGM', group:{name:'setting', id:'0'} })
    public endWinBGM: AudioClip;

    @property({type:AudioClip, displayName:'BGM', group:{name:'BigWin', id:'1'} })
    public bigWinBGM: AudioClip;

    @property({displayName:'PlaySec', tooltip:'播放秒數', group:{name:'BigWin', id:'1'}})
    public bigWinPlaySec = 7;
    @property({displayName:'BreakSec', tooltip:'中斷秒數', group:{name:'BigWin', id:'1'}})
    public bigWinBreakSec = 7;

    @property({type:AudioClip, displayName:'BGM', group:{name:'SuperWin', id:'1'} })
    public superWinBGM: AudioClip;
    @property({displayName:'PlaySec', tooltip:'播放秒數', group:{name:'SuperWin', id:'1'}})
    public superWinPlaySec = 13;
    @property({displayName:'BreakSec', tooltip:'中斷秒數', group:{name:'SuperWin', id:'1'}})
    public superWinBreakSec = 7;

    @property({type:AudioClip, displayName:'BGM', group:{name:'MegaWin', id:'1'} })
    public megaWinBGM: AudioClip;
    @property({displayName:'PlaySec', tooltip:'播放秒數', group:{name:'MegaWin', id:'1'}})
    public megaWinPlaySec = 12;
    @property({displayName:'BreakSec', tooltip:'中斷秒數', group:{name:'MegaWin', id:'1'}})
    public megaWinBreakSec = 7;

    public static Instance : BigWin;
    
    public machine:Machine;
    public setMachine(machine:Machine) { this.machine = machine; }

    public spineTool : SpineRepeatTool;

    /// 播放動態資料
    public BigWinSpineType;

    /// 音樂與播放秒數資料
    public playData;

    /// 正在滾動Label的 tween
    public tweenLabel;

    public onLoad() {
        this.BigWinSpineType = {
            'main': {},
            'coin': {},
        };
        this.BigWinSpineType['main'][BIGWIN_TYPE.BIG_WIN]   = 'play01';
        this.BigWinSpineType['main'][BIGWIN_TYPE.SUPER_WIN] = 'play02';
        this.BigWinSpineType['main'][BIGWIN_TYPE.MEGA_WIN]  = 'play03';
        this.BigWinSpineType['coin'][BIGWIN_TYPE.BIG_WIN]   = 'play01';
        this.BigWinSpineType['coin'][BIGWIN_TYPE.SUPER_WIN] = 'play02';
        this.BigWinSpineType['coin'][BIGWIN_TYPE.MEGA_WIN]  = 'play02';
        
        this.playData = {};
        this.playData[BIGWIN_TYPE.BIG_WIN]   = { clip: this.bigWinBGM,   sec:this.bigWinPlaySec,   break:this.bigWinBreakSec };
        this.playData[BIGWIN_TYPE.SUPER_WIN] = { clip: this.superWinBGM, sec:this.superWinPlaySec, break:this.superWinBreakSec };
        this.playData[BIGWIN_TYPE.MEGA_WIN]  = { clip: this.megaWinBGM,  sec:this.megaWinPlaySec,      break:this.megaWinBreakSec };

        BigWin.Instance = this;
        this.spineTool = this.node.getComponent(SpineRepeatTool);
        this.close();
    }

    public close() {
        this.node.active = false;
        this.numberLabel.string          = '';
        this.bigWibSpine.animation       = 'idle';
        //this.crazyCashDropSpin.animation = 'idle';
        //this.jackptSpine.animation       = 'idle';
        //this.tournamentSpin.animation    = 'idle';
        this.coinSpine.animation         = 'idle';

        this.bigWibSpine.paused          = true;
        //this.crazyCashDropSpin.paused    = true;
        //this.jackptSpine.paused          = true;
        //this.tournamentSpin.paused       = true;
        this.coinSpine.paused            = true;
        this.node.scale = Vec3.ONE;
    }

    public isBigWin(totalWin:number=0) : BIGWIN_TYPE {

        if (totalWin === 0) return BIGWIN_TYPE.NONE;
        let totalBet = this.machine.totalBet;

        if ( totalBet === 0 ) return BIGWIN_TYPE.NONE;
        let winLevelRate = gameInformation._winLevelRate;

        let several = totalWin / totalBet;
        if ( several < winLevelRate['BIG_WIN'] )  return BIGWIN_TYPE.NONE;
        if ( several > winLevelRate['MEGA_WIN'])  return BIGWIN_TYPE.MEGA_WIN;
        if ( several > winLevelRate['SUPER_WIN']) return BIGWIN_TYPE.SUPER_WIN;

        return BIGWIN_TYPE.BIG_WIN;
    }

    public showBigWin(type: BIGWIN_TYPE, fromValue:number, finishValue:number) {
        let data = { value: fromValue };
        let bigWinAni = this.BigWinSpineType['main'][type];
        let coinAni = this.BigWinSpineType['coin'][type];
        let clip = this.playData[type].clip;
        // 0.5 是 BigWin 淡入動態，這時不適合出現數字 Label
        let playSec = this.playData[type].sec - 0.3;

        // 設定播放時間
        let wait = (playSec + 1.3 ) * 1000;

        this.audioSource.stop();
        this.audioSource.clip = clip;
        this.audioSource.play();

        //let track: sp.spine.TrackEntry = this.bigWibSpine.setAnimation(0, bigWinAni, false);
        let track : sp.spine.TrackEntry = this.spineTool.play(bigWinAni);
        this.coinSpine.setAnimation(0, coinAni, true);
        this.bigWibSpine.paused    = false;
        this.coinSpine.paused      = false;

        this.tweenLabel = tween(data).delay(0.3).to(playSec,{ value:finishValue }, {
            onStart:(target:object) => {
                data.value = fromValue;
                BigWin.Instance.numberLabel.string = Utils.numberComma(fromValue);
                console.log(data, finishValue);
            },
            onUpdate:(target:object)=> {
                let value = Math.floor(data.value);
                BigWin.Instance.numberLabel.string = Utils.numberComma(value);
            },
            onComplete(target) {
                BigWin.showBigWinDone();
                // BigWin.Instance.bigWibSpine.setAnimation(0, 'idle', false);
            },
        }).start();

        return wait ;
    }

    public static showBigWinDone() {
        this.Instance.spineTool.repeatEnd();
        // console.log('先這樣');
    }

    public async activeBigWin(totalWin:number=0, onCompleteCallBack:EventHandler) {
        this.node.active = true;

        let type = this.isBigWin(totalWin);
        if ( type === BIGWIN_TYPE.NONE ) return onCompleteCallBack.emit([onCompleteCallBack.customEventData]);
        
        let totalBet = this.machine.totalBet;
        let winLevelRate = gameInformation._winLevelRate;
        let bigWinValue = totalBet * winLevelRate["BIG_WIN"];
        let superWinValue = totalBet * winLevelRate["SUPER_WIN"];
        let megaWinValue = totalBet * winLevelRate["MEGA_WIN"];
        let completeValue = (totalWin >= superWinValue) ? bigWinValue : totalWin;
        
        // 停止目前的音樂
        SoundManager.pauseMusic(1);
        await Utils.delay(1000);
        await Utils.delay(this.showBigWin(BIGWIN_TYPE.BIG_WIN, 0, completeValue));

        if ( totalWin >= superWinValue ) {
            completeValue = (totalWin >= megaWinValue) ? superWinValue : totalWin;
            await Utils.delay(this.showBigWin(BIGWIN_TYPE.SUPER_WIN, bigWinValue, completeValue));
        }

        if ( totalWin >= megaWinValue ) {
            await Utils.delay(this.showBigWin(BIGWIN_TYPE.MEGA_WIN, superWinValue, totalWin));
        }

        SoundManager.resumeMusic();
        BigWin.Instance.coinSpine.setAnimation(0, 'idle', true);
        tween(this.node).delay(2).to(0.3,{scale: Vec3.ZERO}, {
            easing:"backIn",
            onComplete:(target:Node)=>{
                BigWin.Instance.close();
                return onCompleteCallBack.emit([onCompleteCallBack.customEventData]);
            }
        }).start();

        return;
    }
}
