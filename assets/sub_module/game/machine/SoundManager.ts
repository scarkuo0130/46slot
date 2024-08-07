import { _decorator, AudioClip, AudioSource, CCFloat, CCInteger, Component, Enum, Node, tween, game, EventTarget } from 'cc';
import { Utils } from '../../utils/Utils';
const { ccclass, property, disallowMultiple } = _decorator;

/**
 * 音效播放模式
 */
export enum PLAY_MODE {
    NORMAL      = 0,
    ONLY_SOUND  = 1,
    NO_SOUND    = 2,
    length      = 3,
}

/**
 * 音效類型
 */
export enum TYPE_SOUND {
    IS_SOUND = 0,
    IS_MUSIC = 1,
}

export enum DEFAULT_SOUND_ID {
    MAIN_GAME = '0',
    BUTTON = '100',
}

@ccclass('SimpleAudioClipData')
export class SimpleAudioClipData {
        
    @property({displayName:'Active', tooltip:'是否啟用'})
    public active: boolean = true;
    
    @property({type:AudioClip, displayName:"Clip", tooltip:"音效內容(mp3)"})
    public clip: AudioClip;

    @property({type:CCFloat, displayName:"Volume", tooltip:"播放音量0.1 ~ 1", min:0.1, max:1, step:0.1})
    public volume: number = 0.8;

    @property({displayName:'Loop', tooltip:'是否持續播放'})
    public loop : boolean = false;

    public filterSameSound: boolean = false;

    public soundType: TYPE_SOUND = TYPE_SOUND.IS_SOUND;

}

@ccclass('AudioClipData')
export class AudioClipData extends SimpleAudioClipData {
    @property({displayName:'ID', tooltip:'id'})
    public id: string = "";

    @property({displayName:'播放用途', tooltip:'description 僅於記錄查詢'})
    public description: string = "";

    @property({type:Enum(TYPE_SOUND), displayName:'屬於音效還是音樂', tooltip:'soundType'})
    public soundType: TYPE_SOUND = TYPE_SOUND.IS_SOUND;

    @property({displayName:'是否過慮同音效播放', tooltip:'filterSameSound', visible: function(this:AudioClipData) { return this.soundType === TYPE_SOUND.IS_SOUND; }})
    public filterSameSound: boolean = true;

    constructor(data) {
        super();
        if ( data == null ) return;
        this.id = data?.id;
        this.clip = data?.clip;
        this.description = data?.description ;
        this.soundType = data?.soundType;
        this.filterSameSound = data?.filterSameSound;
        
    }
}

@ccclass('SoundManager')
@disallowMultiple(true)
export class SoundManager extends Component {

    @property({type:[AudioClipData], displayName:'SoundList', tooltip:'音效設定列表'})
    public soundList : AudioClipData[] = [];

    @property({displayName:'DefaultMusicID', tooltip:'依照上述[SoundList] 預設播放音樂ID'})
    public defaultMusicId: string = "0";

    @property({type:CCInteger, displayName:'MaxPlaySound', tooltip:'最多同時播放音效數量'})
    public maxPlaySoundCount:number = 15;

    @property({displayName:'過慮同音效播放秒數設定(毫秒)', tooltip:'filterSameSoundSec', step:1, min:0, max:500})
    public filterSameSoundSec : number = 50;

    @property({type:[AudioClipData], displayName:'DefaultSoundList', tooltip:'預設音效列表'})
    public defaultSoundList : AudioClipData[] = [
        new AudioClipData ({ id:DEFAULT_SOUND_ID.MAIN_GAME,    description:'MainGame音樂',     soundType:TYPE_SOUND.IS_MUSIC, filterSameSound:false, loop:true }),
//      new AudioClipData ({ id:DEFAULT_SOUND_ID.FEATURE_GAME, description:'FeatureGame音樂',  soundType:TYPE_SOUND.IS_MUSIC, filterSameSound:false, loop:true }),
//      new AudioClipData ({ id:DEFAULT_SOUND_ID.SPIN,         description:'Spin音效',         soundType:TYPE_SOUND.IS_SOUND, filterSameSound:false }),
//      new AudioClipData ({ id:DEFAULT_SOUND_ID.WHEEL_STOP,   description:'停輪音效',          soundType:TYPE_SOUND.IS_SOUND, filterSameSound:true }),
//      new AudioClipData ({ id:DEFAULT_SOUND_ID.WIN,          description:'贏分音效',          soundType:TYPE_SOUND.IS_SOUND, filterSameSound:true }),
//      new AudioClipData ({ id:DEFAULT_SOUND_ID.NEAR_MISS,    description:'NearMiss音效',     soundType:TYPE_SOUND.IS_SOUND, filterSameSound:true }),
        new AudioClipData ({ id:DEFAULT_SOUND_ID.BUTTON,       description:'共用按鍵聲',        soundType:TYPE_SOUND.IS_SOUND, filterSameSound:false }),
    ];

    private properties = {
        soundList: [],
        isMute : false,
        soundData : {},
        mode: PLAY_MODE.NORMAL,
        lastIndex: 0,
        lastMusicID: "",
    };

    public get isMute() : boolean    { return this.properties.isMute; }
    public set isMute(value:boolean) { this.properties.isMute = value; }

    public static get Mode() : PLAY_MODE { return SoundManager.Instance.properties.mode; }
    public static setMode(mode: PLAY_MODE) : PLAY_MODE
    { 
        if ( mode == null ) return null;
        SoundManager.Instance.properties.mode = mode;

        switch(mode) {
            case PLAY_MODE.NORMAL:
                this.PlayMusic();
                break;

            case PLAY_MODE.NO_SOUND:
            case PLAY_MODE.ONLY_SOUND:
                this.Instance.stopAllSound();
                break;
        }

        return mode;
    }

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

        this.musicAudioSource['event'] = new EventTarget();

        for(let i=0; i<this.maxPlaySoundCount; i++) {
            let soundNode = new Node('soundAudioSource-'+i);
            this.soundAudioSource.push(soundNode.addComponent(AudioSource));
            this.node.addChild(soundNode);
        }

        this.loadSoundData();
        SoundManager.setMode(PLAY_MODE.NORMAL);
    }

    // 播放共用按鍵聲
    public static PlayButtonSound() { SoundManager.PlaySoundByID(DEFAULT_SOUND_ID.BUTTON); }

    /**
     * Web視窗轉移時，會啟動這個 funciton
     */
    public static OnMute() { SoundManager.Instance.onMute(); }
    public onMute() {
        this.isMute = true;
        this.stopAllSound();
    }

    public stopAllSound() {
        this.pauseMusic();
        const soundList = this.soundAudioSource;
        soundList.forEach((sound)=>{ sound.stop(); });
    }

    public static async Resume() { await SoundManager.Instance.resume(); }

    public async resume() {
        this.isMute = false;
        await Utils.delay(1000);
        this.playMusic();
    } 

    public start() {
        this.playMusic();
    }

    private loadSoundData() {

        this.properties.soundData = {};
        let soundData = this.properties.soundData;

        let defaultSoundList = this.defaultSoundList;
        for(let i in defaultSoundList) {
            let sound = defaultSoundList[i];
            if (sound.id == null) continue;
            if (sound.id.length == 0) continue;
            if (sound.clip == null) continue;
            soundData[sound.id] = sound;
        }

        if (this.soundList == null ) return;
        if (this.soundList.length === 0 ) return;
        let soundList = this.soundList;
        for(let i in soundList) {
            let sound = soundList[i];
            if (sound.id == null) continue;
            if (sound.id.length == 0) continue;
            if (sound.clip == null) continue;
            
            soundData[sound.id] = sound;
        }
    }

    private get lastMusicID() : string { return this.properties.lastMusicID; }
    private set lastMusicID(value:string) { this.properties.lastMusicID = value; }

    private static lastPlayIdx = 0;
    private get lastPlayIdx () : number { return this.properties.lastIndex; }
    private set lastPlayIdx (value:number) { this.properties.lastIndex = value; }
    
    /**
     * 取得音效來源
     * @internal 請別直接使用這個 function, 請使用這個 playSoundData 或 playSoundByID 來播放音效
     * @param soundType 
     * @returns { AudioSource || Null }
     */
    private getAudioSource(soundType:TYPE_SOUND) : AudioSource {
        if ( soundType === TYPE_SOUND.IS_MUSIC ) return this.musicAudioSource;

        this.lastPlayIdx ++;
        if ( this.lastPlayIdx >= this.maxPlaySoundCount ) this.lastPlayIdx = 0;
        if ( this.soundAudioSource == null ) this.soundAudioSource[this.lastPlayIdx] = new AudioSource();
        return this.soundAudioSource[this.lastPlayIdx];
    }

    /**
     * 播放音效
     * @internal 請別直接使用這個 function, 請使用這個 playSoundData 或 playSoundByID 來播放音效
     * @param clip      { AudioClip } 音效
     * @param soundType { int  }      音效類型 IS_SOUND || IS_MUSIC
     * @param volume    { float }      音量 0~1
     * @param loop      { boolean }   是否循環播放
     * @returns { AudioSource || Null }
     */
    private playSound(clip:AudioClip, soundType:TYPE_SOUND=TYPE_SOUND.IS_SOUND, volume:number=0.8, loop:boolean, option:any=null) : any {
        if ( clip == null ) return null;
        let source = this.getAudioSource(soundType);
        if ( source == null ) return null;
        source.stop();
        source.clip         = clip;
        source.volume       = volume;
        source.loop         = loop;
        source.play();
        source['playTime']  = Date.now();
        this.playSoundOption(source, option);
        return source;
    }

    private async playSoundOption(source:AudioSource, option:{onComplete:Function, onStart:Function}=null) {
        if ( source == null ) return;
        if ( option == null ) return;

        if ( option.onStart != null ) {
            option.onStart(source);
        }

        if ( option.onComplete != null ) {
            while(source.playing) { await Utils.delay(100); }
            option.onComplete(source);
        }
    }

    /**
     * 播放音效
     * @internal 請別直接使用這個 function, 請使用這個 playSoundData 或 playSoundByID 來播放音效
     * @param clip           { AudioClip } 音效
     * @param soundType      { int  }      音效類型 IS_SOUND || IS_MUSIC 
     * @param volume         { float }      音量 0~1 
     * @param loop           { boolean }   是否循環播放
     * @param filterSameSound { boolean }   是否過濾同音效播放
     * @returns { AudioSource || Null }
     */
    private playFilteredSound(clip:AudioClip, soundType:TYPE_SOUND=TYPE_SOUND.IS_SOUND, volume:number=0.8, loop:boolean, filterSameSound:boolean=false, option:any) : AudioSource {
        if ( filterSameSound === false ) return this.playSound(clip, soundType, volume, loop, option);
        const sourceList = this.soundAudioSource;
        const now = Date.now();
        
        for(let i in sourceList) {
            let source = sourceList[i];
            if ( source.clip !== clip )                              continue;
            if ( source.state !== AudioSource.AudioState.PLAYING )   continue;
            if ( source['playTime'] == null )                        continue;
            if ( now - source['playTime'] > this.filterSameSoundSec ) continue; // 50ms 以內的音效不重複播放
            return source;
        }

        return this.playSound(clip, soundType, volume, loop, option);
    }

    /**
     * 播放音效
     * @param data { SimpleAudioClipData } 音效資料
     * @returns { AudioSource || Null }
     * 請使用這個 playSoundData 或 playSoundByID 來播放音效
     */
    public playSoundData(data:SimpleAudioClipData, loop:boolean=null, option:any=null) : AudioSource {
        const mode = SoundManager.Mode;

        if ( this.isMute === true )        return null;
        if ( data == null )                return null;
        if ( data.clip == null )           return null;
        if ( data.active === false )       return null;
        if ( mode === PLAY_MODE.NO_SOUND ) return null;
        if ( mode === PLAY_MODE.ONLY_SOUND && data.soundType === TYPE_SOUND.IS_MUSIC ) return null;
        if ( loop == null ) loop = data.loop;

        return this.playFilteredSound(data.clip, data.soundType, data.volume, loop, data.filterSameSound, option);
    }
    public static PlaySoundData(data:SimpleAudioClipData, loop:boolean=null, option=null) : AudioSource { return SoundManager.Instance.playSoundData(data, loop, option); }

    /**
     * 播放指定ID音效
     * @param id { string } 音效代號
     * @returns { AudioSource || Null }
     * 
     * 請使用這個 function 或 playSoundData 來播放音效
     */
    public playSoundByID(id:string, loop:boolean=null, option:{onComplete?:Function|null, onStart?:Function|null}=null) : AudioSource {
        if ( this.properties.soundData == null ) return null;
        if ( this.properties.soundData[id] == null ) return null;
        return this.playSoundData(this.properties.soundData[id], loop, option);
    }
    public static PlaySoundByID(id:string, loop:boolean=null, option:{onComplete?:Function|null, onStart?:Function|null}=null) : AudioSource { return SoundManager.Instance.playSoundByID(id, loop, option); }

    /**
     * 播放音樂
     * @param id { string } 音樂代號 || 最後播放音樂代號 || 預設音樂代號
     * @returns { AudioSource || Null }
     */
    public playMusic(id:string=null) : AudioSource {
        id = ( id || this.lastMusicID || this.defaultMusicId);
        this.lastMusicID = id;
        return this.playSoundByID(id);
    }

    public static PlayMusic(id:string=null) : AudioSource { return SoundManager.Instance.playMusic(id); }

    /**
     * 暫停音樂
     * @param fadeoutSec { float } 淡出秒數, 0 為直接暫停
     * @returns { AudioSource }
     */
    public async pauseMusic(fadeoutSec:number=0.5) : Promise<any> {
        if ( this.musicAudioSource == null ) return;
        if ( fadeoutSec === 0 ) return this.musicAudioSource.pause();

        let event : EventTarget = this.musicAudioSource['event'] || new EventTarget();
        let musicAudioSource = this.musicAudioSource;

        event.removeAll('done');
        musicAudioSource['event'] = event;
        musicAudioSource['fromVolume'] = this.musicAudioSource.volume;
        tween(musicAudioSource).to(fadeoutSec, {volume:0}).call(()=> { 
            musicAudioSource.pause(); 
            musicAudioSource['event']?.emit('done');
        }).start();

        await Utils.delayEvent(event);
        return musicAudioSource;
    }

    public static async PauseMusic(fadeoutSec:number=0.5) { await SoundManager.Instance.pauseMusic(fadeoutSec); }

    /**
     * 恢復音樂
     * @param fadeinSec { float } 淡入秒數
     */
    public resumeMusic(fadeinSec:number=0.5) {
        if ( this.musicAudioSource == null ) return;
        const fromVolume = this.musicAudioSource['fromVolume'] || 0.8;

        if ( fadeinSec === 0 ) {
            this.musicAudioSource.volume = fromVolume;
            return this.musicAudioSource.play();
        }

        this.musicAudioSource.volume = 0;
        tween(this.musicAudioSource).to(fadeinSec, {volume:fromVolume}).start();
    }

    public static ResumeMusic(fadeinSec:number=0.5) { SoundManager.Instance.resumeMusic(fadeinSec); }

    /**
     * 淡出目前播放音樂，並播放新音樂
     * @param id 
     * @param fadeoutSec 
     * @returns 
     */
    public async smoothChangeMusic(id:string, fadeoutSec:number=0.5) {
        if ( id == null ) return;

        await this.pauseMusic(fadeoutSec);
        this.playMusic(id);
    }

    public static async SmoothChangeMusic(id:string, fadeoutSec:number=0.5) { await SoundManager.Instance.smoothChangeMusic(id, fadeoutSec); }
}

