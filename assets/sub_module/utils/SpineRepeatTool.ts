import { _decorator, Component, EventHandler, Node, sp } from 'cc';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

@ccclass('SpineRepeatData')
export class SpineRepeatData {
    @property({displayName:'Animation', tooltip:'動畫名稱'})
    public animation = "";

    @property({displayName:'RepeatFirstTime', tooltip:'第一次重複播放起始秒數', step:0.1, min:0 })
    public repeatFirstTime = 0;

    @property({displayName:'RepeatStartTime', tooltip:'重複播放起始秒數', step:0.1, min:0 })
    public repeatStartTime = 0;

    @property({displayName:'RepeatEndTime', tooltip:'重複播放的結束秒數', step:0.1, min:0 })
    public repeatEndTime = 0;

    @property({type:EventHandler, displayName:'repeatCallHandler', tooltip:'每次重播呼叫函示'})
    public repeatHandler : EventHandler = new EventHandler();
}


@ccclass('SpineRepeatTool')
export class SpineRepeatTool extends Component {

    @property({type:[SpineRepeatData], displayName:'RepeatData'})
    public repeatList : SpineRepeatData[] = [];
    @property({type:sp.Skeleton})
    public mainSpine : sp.Skeleton;
    public mainTrack : sp.spine.TrackEntry;

    public _repeatEnd : boolean;
    public _animationEnd : boolean;
    public _looping : boolean;

    public repeatData;

    public onLoad() {
        if (this.mainSpine == null){
            this.mainSpine = this.node.getComponent(sp.Skeleton);
        }
        this.repeatData = {};
        for(let i in this.repeatList) {
            let data = this.repeatList[i];
            this.repeatData[data.animation] = data;
        }
    }

    public start() {
        console.warn(this);
        this.debugLoop();
    }

    public async debugLoop() {
        this.play('flip');
        await Utils.delay(2000);
        this.debugLoop();
    }

    public play(animation:string) {
        if ( this.repeatData[animation] == null ) return null;
        let data : SpineRepeatData= this.repeatData[animation];
        return this.playAnimation(animation, data.repeatStartTime, data.repeatEndTime, data.repeatFirstTime, data.repeatHandler);
    }


    public playAnimation(animation:string, startTime:number, endTime:number, firstStartTime:number, event:EventHandler=null) {
        this._repeatEnd = false;
        this._animationEnd = false;
        this._looping = false;

        this.mainTrack = this.mainSpine.setAnimation(0, animation, true);
        this.mainTrack.animationEnd = endTime;
        let self = this;
        this.mainSpine.setCompleteListener((track) => {
            console.log('setCompleteListener ok', track);
            if ( event != null ) event.emit([track]);

            if ( self._animationEnd === true ) return;

            if ( self._repeatEnd === true ) {
                self.mainTrack = self.mainSpine.setAnimation(0, animation, false);
                self.mainTrack.animationStart = endTime;
                self._animationEnd = true;
            } else {
                if ( this._looping === false ) {
                    this._looping = true;
                    self.mainTrack.animationStart = firstStartTime;
                } else {
                    self.mainTrack.animationStart = startTime;
                }
            }
        });

        return this.mainTrack;
    }

    public repeatEnd() { this._repeatEnd = true; }
}

