
import { _decorator, Component, Node, Vec2, sp, instantiate, Size, size } from 'cc';
import { SimpleAudioClipData, SoundManager } from './SoundManager';
import { Machine } from '../machine/Machine';
import { ObjectPool } from '../ObjectPool';
import { Wheel } from './Wheel';
import { Utils } from '../../utils/Utils';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('SymbolSpineInspect')
export class SymbolSpineInspect {
    @property({ displayName: 'SpineNode', type: Node, tooltip: 'Spine動態的Node' })
    public spine: Node;

    @property({ displayName: '一般狀態動態名稱', tooltip: 'normalAnimation' })
    public normalAnimation: string = 'idle';

    @property({ displayName: '滾動時動態名稱', tooltip: 'moveAnimation' })
    public moveAnimation: string = 'blur';

    @property({ displayName: '贏分狀態動態名稱', tooltip: 'winAnimation' })
    public winAnimation: string = 'play';

    @property({ displayName: 'loop播放贏分動態', tooltip: 'loopWinAnimation' })
    public loopWinAnimation: boolean = false;

    @property({ displayName: '滾停狀態動態名稱', tooltip: 'dropAnimation' })
    public dropAnimation: string = 'idle';
}

@ccclass('Symbol/Inspect')
export class Inspect {

    @property({ displayName: "ID", step: 1, tooltip: 'id'})
    public id: number = 0;

    @property({ group: { name: 'Spine Mode', id: '10' }, type: SymbolSpineInspect })
    public spineInspect: SymbolSpineInspect = new SymbolSpineInspect();
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

    private properties: any = {
        machine: Machine,
        size: new Size(1, 1),
        position: new Vec2(0, 0),
        data : {},
    };

    public get symID() { return this.inspect.id; }
    public get spine() : sp.Skeleton | null { return this.properties.data['spine']; }

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
    }

    protected start(): void { this.initNodeData(); }

    public onLoad(): void {
        
        let [ normal, move, win, drop ] = [ 
            this.inspect.spineInspect.normalAnimation, 
            this.inspect.spineInspect.moveAnimation, 
            this.inspect.spineInspect.winAnimation, 
            this.inspect.spineInspect.dropAnimation 
        ];  

        let spine = this.inspect.spineInspect.spine?.getComponent(sp.Skeleton);
        this.properties.data[TYPE_STATE.NORMAL] = { 'spine': normal, 'duration': Utils.getAnimationDuration(spine, normal) };
        this.properties.data[TYPE_STATE.MOVE]   = { 'spine': move,   'duration': Utils.getAnimationDuration(spine, move) };
        this.properties.data[TYPE_STATE.WIN]    = { 'spine': win,    'duration': Utils.getAnimationDuration(spine, win) };
        this.properties.data[TYPE_STATE.DROP]   = { 'spine': drop,   'duration': Utils.getAnimationDuration(spine, drop)};
        this.properties.data['spine']           = spine;

        ObjectPool.registerNode(this.inspect.id, this.node);
    }

    public remove() { 
        this.node.active = false;
        return ObjectPool.Put(this.symID, this.node); 
    }

    public getAnimationDuration(type: TYPE_STATE = TYPE_STATE.WIN) { return this.properties.data[type].duration; }

    onEnable() { this.normal(); }

    protected showState(type: TYPE_STATE) {
        this.clearState();
        this.spine?.setAnimation(0, this.properties.data[type].spine, false);
    }

    public normal() { return this.showState(TYPE_STATE.NORMAL); }
    public moving() { return this.showState(TYPE_STATE.MOVE); }
    public win()    { return this.showState(TYPE_STATE.WIN); }
    public drop()   { return this.showState(TYPE_STATE.DROP); }

    public async winAsync() {
        this.win();
        await Utils.delay(this.properties.data[TYPE_STATE.WIN].duration * 1000);
    }

    // 清理狀態
    public clearState() { this.spine?.clearTracks(); }
}

