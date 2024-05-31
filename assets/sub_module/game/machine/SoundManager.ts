import { _decorator, AudioClip, AudioSource, CCFloat, CCInteger, Component, Enum, Node, tween, game } from 'cc';
import { Utils } from '../../utils/Utils';
const { ccclass, property } = _decorator;

export enum PLAY_MODE {
    NORMAL = 0,
    ONLY_SOUND = 1,
    NO_SOUND = 2,
}

export enum TYPE_SOUND {
    IS_SOUND = 0,
    IS_MUSIC = 1,
}

@ccclass('SimbpleAudioClipData')
export class SimbpleAudioClipData {
    @property({type:AudioClip, displayName:"Clip", tooltip:"音效內容(mp3)"})
    public clip: AudioClip;

    @property({type:CCFloat, displayName:"Volume", tooltip:"播放音量0.1 ~ 1", min:0.1, max:1, step:0.1})
    public volume: number = 0.8;

    @property({displayName:'Loop', tooltip:'是否持續播放'})
    public loop : boolean = false;
}

@ccclass('AudioClipData')
export class AudioClipData {
    @property({displayName:'SoundID', tooltip:'播放ID設定'})
    public id: string = "";

    @property({type:AudioClip, displayName:"Clip", tooltip:"音效內容(mp3)"})
    public clip: AudioClip;

    @property({type:CCFloat, displayName:"Volume", tooltip:"播放音量0.1 ~ 1", min:0.1, max:1, step:0.1})
    public volume: number = 0.8;

    @property({type:Enum(TYPE_SOUND), displayName:'Type', tooltip:'屬於音效還是音樂'})
    public isMusic: TYPE_SOUND = TYPE_SOUND.IS_SOUND;
}

@ccclass('SoundManager')
export class SoundManager extends Component {

    @property({type:[AudioClipData], displayName:'SoundList', tooltip:'音效設定列表'})
    public soundList : AudioClipData[] = [];

    @property({displayName:'DefaultMusicID', tooltip:'依照上述[SoundList] 預設播放音樂ID'})
    public defaultMusicId: string = "";

    @property({type:CCInteger, displayName:'MaxPlaySound', tooltip:'最多同時播放音效數量'})
    public maxPlaySoundCount:number = 10;

    public static isMute = false;

    public static soundData : {};

    //#region 音效播放模式
    public static mode: PLAY_MODE = PLAY_MODE.NORMAL;
    public static getMode() { return SoundManager.mode; }
    public static setMode(mode: PLAY_MODE) : PLAY_MODE
    { 
        SoundManager.mode = mode; 

        switch(mode) {
            case PLAY_MODE.NORMAL:
                SoundManager.playMusic(SoundManager.lastMusicID);
                break;

            case PLAY_MODE.NO_SOUND:
            case PLAY_MODE.ONLY_SOUND:
                SoundManager.stopMusic(1);
                break;
        }

        return mode;
    }
    //#endregion

    public soundAudioSource : AudioSource[] = [];
    public musicAudioSource : AudioSource;

    public static Instance : SoundManager;
    protected onLoad(): void { 
        
        game.on("game_on_hide", SoundManager.OnMute);
        game.on("game_on_show", SoundManager.Resume);
        SoundManager.Instance = this; 
        let musicNode = new Node('musicAudioSource');
        this.musicAudioSource = musicNode.addComponent(AudioSource);
        this.node.addChild(musicNode);

        for(let i=0; i<this.maxPlaySoundCount; i++) {
            let soundNode = new Node('soundAudioSource-'+i);
            this.soundAudioSource.push(soundNode.addComponent(AudioSource));
            this.node.addChild(soundNode);
        }

        SoundManager.loadSoundData();
        SoundManager.setMode(PLAY_MODE.NORMAL);
    }

    /**
     * Web視窗轉移時，會啟動這個 funciton
     */
    public static OnMute() {
        console.log('trigger game_on_hide');
        SoundManager.isMute = true;

        SoundManager.pauseMusic(0);
        let soundList = SoundManager.Instance.soundAudioSource;
        for(let i in soundList) {
            if ( soundList[i] == null ) continue;
            soundList[i].stop();
        }
    }

    public static Resume() {
        SoundManager.isMute = false;
        setTimeout(() => {
            SoundManager.playMusic(SoundManager.lastMusicID);    
        }, 1000);
        
    }

    protected start() {
        SoundManager.playClip(this.defaultMusicId);
        SoundManager.queuePlaySoundList = [];
    }

    private static loadSoundData() {
        if (SoundManager.Instance.soundList == null ) return;
        if (SoundManager.Instance.soundList.length === 0 ) return;

        SoundManager.soundData = {};
        let soundData = SoundManager.soundData;
        let soundList = SoundManager.Instance.soundList;

        for(let i in soundList) {
            let sound = soundList[i];
            if (sound.id == null) continue;
            if (sound.id.length == 0) continue;
            if (sound.clip == null) continue;
            
            soundData[sound.id] = sound;
        }
    }

    private static lastMusicID:string;
    private static lastPlayIdx = 0;
    public static playClip(id: string) {
        let mode = SoundManager.getMode();

        if (SoundManager.soundData == null) return;

        let sound : AudioClipData = SoundManager.soundData[id];
        if (sound == null) return;

        if ( sound.isMusic == TYPE_SOUND.IS_MUSIC) {
            let audioSource = SoundManager.Instance.musicAudioSource;
            SoundManager.lastMusicID = id;
            if ( SoundManager.isMute === true ) return;
            if ( mode == PLAY_MODE.ONLY_SOUND ) return;
            if ( audioSource.state == AudioSource.AudioState.PLAYING ) {
                if (sound.clip === audioSource.clip ) return;
            }

            audioSource.stop();
            audioSource.clip = sound.clip;
            audioSource.volume = sound.volume;
            audioSource.loop = true;
            audioSource.play();
        } else {
            if ( mode === PLAY_MODE.NO_SOUND) return;
            if ( SoundManager.isMute === true ) return;
            return SoundManager.playSound(sound.clip, sound.volume, false);
        }
    }

    /**
     * 播放音樂
     * @param musicID 音樂代號
     * @param fadeoutSec 淡出秒數
     */
    public static async playMusic(musicID, fadeoutSec:number=0) {
        let mode = SoundManager.getMode();

        SoundManager.lastMusicID = musicID;
        if ( mode === PLAY_MODE.NO_SOUND) return;
        if ( mode === PLAY_MODE.ONLY_SOUND ) return;
        if ( SoundManager.soundData == null ) return;
        if ( SoundManager.isMute === true ) return;
        
        let sound : AudioClipData = SoundManager.soundData[musicID];
        if (sound == null) return;

        if ( fadeoutSec == 0 ) return SoundManager.playClip(musicID);
        SoundManager.stopMusic(fadeoutSec);
        await Utils.delay(fadeoutSec*1000+100);
        SoundManager.playClip(musicID);
    }

    /**
     * 暫停音樂
     * @param fadeoutSec 淡出秒數
     */
    public static pauseMusic(fadeoutSec:number=0) {
        if ( SoundManager.Instance.musicAudioSource == null ) return;

        if ( fadeoutSec == 0 ) {
            return SoundManager.Instance.musicAudioSource.pause();
        }

        tween(SoundManager.Instance.musicAudioSource).to(fadeoutSec, {volume:0},{
            onComplete:(n)=>{
                SoundManager.Instance.musicAudioSource.pause();
        }}).start();
    }

    /**
     * 有經過 pause 暫停音樂，可以用這個恢復
     * @param fadeinSec 漸變秒數
     * @returns 
     */
    public static resumeMusic(fadeinSec:number=0) {
        if ( SoundManager.Instance.musicAudioSource == null ) return;

        if ( fadeinSec == 0 ) {
            SoundManager.Instance.musicAudioSource.volume = 0.8;
            return SoundManager.Instance.musicAudioSource.play();
        }

        SoundManager.Instance.musicAudioSource.volume = 0;
        tween(SoundManager.Instance.musicAudioSource).to(fadeinSec, {volume:0.8}).start();
    }

    /**
     * 停止音樂
     * @param fadeout 淡出秒數，預設0 
     * @returns 
     */
    public static stopMusic(fadeoutSec:number=0) {
        if ( SoundManager.Instance.musicAudioSource == null ) return;
        if ( fadeoutSec === 0 ) return SoundManager.Instance.musicAudioSource.stop();

        if ( SoundManager.Instance.musicAudioSource.state != 1 ) return;

        tween(SoundManager.Instance.musicAudioSource).to(fadeoutSec, {volume:0},{
            onComplete:(n)=>{ SoundManager.Instance.musicAudioSource.stop();
        }}).start();
    }

    public static getAudioSource() : AudioSource {
        SoundManager.lastPlayIdx ++;
        if ( SoundManager.lastPlayIdx >= SoundManager.Instance.maxPlaySoundCount ) SoundManager.lastPlayIdx = 0;
        return SoundManager.Instance.soundAudioSource[SoundManager.lastPlayIdx];
    }

    private static queuePlaySoundList : SimbpleAudioClipData[] = [];

    /**
     * @param clip 音樂
     * @param volume 音量 0~1
     */
    public static playSound(clip:AudioClip, volume:number=1, loop:boolean) :AudioSource {
        if ( !clip ) return;
        if (SoundManager.getMode() === PLAY_MODE.NO_SOUND) return;
        if ( SoundManager.isMute === true ) return;

        let auSource = SoundManager.getAudioSource();

        auSource.stop();
        auSource.clip = clip;
        auSource.volume = volume;
        auSource.loop = loop;
        auSource.play();
        return auSource;
    }

    public static async queuePlayerSound(data:SimbpleAudioClipData) {

        // console.log(this.queuePlaySoundList);
        if ( this.queuePlaySoundList.length != 0 ) {
            // if ( this.queuePlaySoundList.includes(data) === true ) return;
            for(let i in this.queuePlaySoundList) {
                let queue = this.queuePlaySoundList[i];
                if ( data.clip === queue.clip ) return;
            }
            this.queuePlaySoundList.push(data);
            return;
        } else {
            this.queuePlaySoundList = [data];
            await Utils.delay(50);

            for(let i in this.queuePlaySoundList) {
                let data = this.queuePlaySoundList[i];
                SoundManager.playSound(data.clip, data.volume, data.loop);
            }

            this.queuePlaySoundList = [];
        }
    }

    public static playSoundData(data:SimbpleAudioClipData, ququPlay:boolean=true) {
        if ( data == null ) return null;
        if ( data.clip === null ) return null;
        if ( ququPlay === true ) return this.queuePlayerSound(data);
        return SoundManager.playSound(data.clip, data.volume, data.loop);
    }
}

