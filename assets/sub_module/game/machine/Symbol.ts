
import { _decorator, Component, Node, Vec2, sp, instantiate, Size, size, EventHandler } from 'cc';
import { SimpleAudioClipData, SoundManager } from './SoundManager';
import { Machine } from '../machine/Machine';
import { ObjectPool } from '../ObjectPool';
import { Wheel } from './Wheel';
import { Utils } from '../../utils/Utils';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('symbolAnimationData')
/**
 * Symbol 播放動態設定檔
 */
export class symbolAnimationData { 
    @property({ displayName: '動態名稱', tooltip: 'normalAnimation' })
    public animation: string = '';

    @property({ type: EventHandler, displayName: '呼叫函式', tooltip: 'callEvent, 有需要執行其他事件時可以設定' })
    public callEvent: EventHandler = new EventHandler();

    @property({ displayName: '播放音效代號', tooltip: 'soundID, 如有需要播放音效，需使用SoundManager註冊音效ID' })
    public soundID: string = '';

    public duration: number = 0;

    constructor(animation : null | string = '') {
        if ( animation == null ) animation = '';
        this.animation = animation;
    }
}

@ccclass('Symbol/Inspect')
export class Inspect {

    @property({ displayName: "ID", step: 1, tooltip: 'id'})
    public id: number = 0;

    @property({ displayName: '顯示優先權', tooltip: 'isPriority, 當Symbol互相疊加時，優先權較高的設定會壓到其他Symbol' })
    public isPriority:boolean = false;

    @property({ displayName: 'SpineNode', type: Node, tooltip: 'Spine動態的Node' })
    public spine: Node;

    @property({ displayName: '停止狀態', type: symbolAnimationData, tooltip: 'idleAnimation', group: { name: '停止狀態', id: '20' } })
    public idleAnimation: symbolAnimationData = new symbolAnimationData('idle');

    @property({ displayName: '移動狀態', type: symbolAnimationData, tooltip: 'blurAnimation', group: { name: '移動狀態', id: '20' } })
    public blurAnimation: symbolAnimationData = new symbolAnimationData('blur');

    @property({ displayName: '贏分狀態', type: symbolAnimationData, tooltip: 'winAnimation', group: { name: '贏分狀態', id: '20' } })
    public winAnimation: symbolAnimationData = new symbolAnimationData('play');

    @property({ displayName: '落地狀態', type: symbolAnimationData, tooltip: 'dropAnimation', group: { name: '落地狀態', id: '20' } })
    public dropAnimation: symbolAnimationData = new symbolAnimationData('idle');

    @property({ displayName: 'start事件', type: EventHandler, tooltip: 'onstartEvent, start() 額外呼叫' })
    public onstartEvent: EventHandler = new EventHandler();

}

export enum TYPE_STATE {
    NORMAL = 0,
    MOVE = 1,
    WIN = 2,
    DROP = 3,
}

@ccclass('Symbol')
@disallowMultiple(true)
@menu('SlotMachine/Symbol')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.stbc9k1roaiu')
export class Symbol extends Component {

    @property({ displayName: 'Symbol Setting', type: Inspect, group: { name: 'Symbol Setting', id: '0' } })
    public inspect: Inspect = new Inspect();
    public machine: Machine;
    public wheel : Wheel;

    public properties: any = {
        machine: Machine,
        size: new Size(1, 1),
        position: new Vec2(0, 0),
        data : {},
    };

    public get symID() { return this.inspect.id; }
    public get spine() : sp.Skeleton | null { return this.properties.data['spine']; }
    public get isPriority() : boolean { return this.inspect.isPriority === true; }

    /// <summary>
    /// 初始化 Node 資料
    private initNodeData() {
        Object.defineProperty(this.node, 'SymID',   { get: () => this.symID });
        Object.defineProperty(this.node, 'symbol',  { get: () => this });
        Object.defineProperty(this.node, 'size',    { get: () => this.properties.size });
        Object.defineProperty(this.node, 'machine', { get: () => this.properties.machine, set: (value) => this.properties.machine = value });
        Object.defineProperty(this.node, 'spine',   { get: () => this.spine });
        this.node['normal'] = this.normal.bind(this);
        this.node['moving'] = this.moving.bind(this);
        this.node['drop']   = this.drop.bind(this);
        this.node['win']    = this.win.bind(this);
        this.node['winDur'] = this.getAnimationDuration.bind(this, TYPE_STATE.WIN);
        this.node['remove'] = this.remove.bind(this);

        if ( this.inspect.onstartEvent != null ) this.inspect.onstartEvent.emit([this]);
    }

    protected start(): void { this.initNodeData(); }

    public onLoad(): void {
        
        let [ normal, move, win, drop ] = [ 
            this.inspect.idleAnimation.animation,
            this.inspect.blurAnimation.animation,
            this.inspect.winAnimation.animation,
            this.inspect.dropAnimation.animation,
        ];  

        let spine = this.inspect.spine?.getComponent(sp.Skeleton);
        this.properties.animationData = [
            this.inspect.idleAnimation,
            this.inspect.blurAnimation,
            this.inspect.winAnimation,
            this.inspect.dropAnimation,
        ];
        this.properties.animationData[TYPE_STATE.NORMAL].duration = Utils.getAnimationDuration(spine, normal);
        this.properties.animationData[TYPE_STATE.MOVE].duration   = Utils.getAnimationDuration(spine, move);
        this.properties.animationData[TYPE_STATE.WIN].duration    = Utils.getAnimationDuration(spine, win);
        this.properties.animationData[TYPE_STATE.DROP].duration   = Utils.getAnimationDuration(spine, drop);
        this.properties.data['spine']                             = spine;

        ObjectPool.registerNode(this.inspect.id, this.node);
    }

    public remove() { 
        this.node.active = false;
        return ObjectPool.Put(this.symID, this.node); 
    }

    public getAnimationDuration(type: TYPE_STATE = TYPE_STATE.WIN) { return this.properties.animationData[type].duration; }

    onEnable() { this.normal(); }

    protected async showState(type: TYPE_STATE) {
        const spine = this.spine;
        const animationData : symbolAnimationData = this.properties.animationData[type];
        let { animation, callEvent, soundID  } = animationData;

        if ( spine == null ) return;
        spine.clearTracks();
        if ( animation != null && animation.length > 0 ) Utils.playSpine(spine, animation);
        if ( callEvent != null ) callEvent.emit([this]);
        if ( soundID != null && soundID.length > 0 ) SoundManager.PlaySoundByID(soundID);
    }

    public normal() { return this.showState(TYPE_STATE.NORMAL); }
    public moving() { return this.showState(TYPE_STATE.MOVE); }
    public win()    { return this.showState(TYPE_STATE.WIN); }
    public drop()   { return this.showState(TYPE_STATE.DROP); }
}

