
import { _decorator, Component, Node, Vec2, sp, instantiate, Size } from 'cc';
import { SimbpleAudioClipData, SoundManager } from './SoundManager';
import { Machine } from './Machine';
import { ObjectPool } from '../ObjectPool';
import { Wheel } from './Wheel';
import { PayTable4500 } from '../../../4500/scripts/PayTable4500';
import { Utils } from '../../utils/Utils';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;



@ccclass('SymbolMoveInscept')
export class SymbolMoveInscept {

    @property({ displayName: 'NormalNode', type: Node, tooltip: '(nomralNode)一般狀態的顯示 Node' })
    public nomralNode?: Node;

    @property({ displayName: 'MoveNode', type: Node, tooltip: '(moveNode)移動狀態的顯示 Node' })
    public moveNode?: Node;

    @property({ displayName: 'WinNode', type: Node, tooltip: '(winNode)顯示贏分的動態 Node' })
    public winNode?: Node;

    @property({ displayName: 'StopNode', type: Node, tooltip: '(stopNode)停止效果 Node' })
    public stopNode?: Node;

    @property({ displayName: 'NoWinNode', type: Node, tooltip: '(noWinNode)顯示沒有贏分的動態 Node' })
    public noWinNode?: Node;
}

@ccclass('SymbolSpineInscept')
export class SymbolSpineInscept {
    @property({ displayName: 'SpineNode', type: Node, tooltip: 'Spine動態的Node' })
    public spine: Node;

    @property({ displayName: 'NormalAnimation', tooltip: '(normalAnimation)一般狀態動態名稱' })
    public normalAnimation: string = "";

    @property({ displayName: 'MoveAnimation', tooltip: '(moveAnimation)移動狀態動態名稱' })
    public moveAnimation: string = "";

    @property({ displayName: 'WinAnimation', tooltip: '(winAnimation)贏分狀態動態名稱' })
    public winAnimation: string = "";

    @property({ displayName: 'LoopWin', tooltip: '循環播放贏分狀態' })
    public loopWinAnimation: boolean = false;

    @property({ displayName: 'StopAnimation', tooltip: '(stopAnimation)滾停狀態動態名稱' })
    public stopAnimation: string = "";

    @property({ displayName: 'NonWinAnimation', tooltip: '(noWinAnimation)沒贏分狀態動態名稱' })
    public noWinAnimation: string = "";

}

@ccclass('SymbolInscept')
export class SymbolInscept {

    @property({ displayName: "ID" })
    public id: string = "";

    @property({ group: { name: 'Spine Mode', id: '10' }, type: SymbolSpineInscept })
    public spineInscept: SymbolSpineInscept = new SymbolSpineInscept();

    @property({ group: { name: 'Single Mode', id: '10' }, type: SymbolMoveInscept })
    public singleInscept: SymbolMoveInscept = new SymbolMoveInscept();

    @property({ type: SimbpleAudioClipData, displayName: 'WinAudio', tooltip: '贏分時播放音效', group: { name: 'Audio Setting', id: '0' } })
    public winAudio: SimbpleAudioClipData = new SimbpleAudioClipData();

    @property({ type: SimbpleAudioClipData, displayName: 'EliminateAudio', tooltip: '圖騰消失時播放的提示音', group: { name: 'Audio Setting', id: '0' } })
    public eliminateAudio: SimbpleAudioClipData = new SimbpleAudioClipData();

    @property({ type: SimbpleAudioClipData, displayName: 'DropAudio', tooltip: '圖騰出現時播放的提示音', group: { name: 'Audio Setting', id: '0' } })
    public dropAudio: SimbpleAudioClipData = new SimbpleAudioClipData();
}

export enum TYPE_STATE {
    NORMAL = 0,
    MOVE = 1,
    WIN = 2,
    STOP = 3,
    NOWIN = 4,
}

@ccclass('Symbol')
@disallowMultiple(true)
@menu('SlotMachine/Symbol')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.stbc9k1roaiu')
export class Symbol extends Component {

    @property({ displayName: 'Symbol Setting', type: SymbolInscept, group: { name: 'Symbol Setting', id: '0' } })
    public inscept: SymbolInscept = new SymbolInscept();
    public machine: Machine;
    public wheel : Wheel;

    public _symbolSize: Size = new Size(1, 1);
    protected _wheelPosition: Vec2 = new Vec2();
    protected _lastStateNode: Node = null;
    protected _lastSingleStateNode: Node = null;
    protected _stateData: any = {};

    public get symID() { return parseInt(this.inscept.id); }

    public onLoad(): void {
        if (this.inscept.id == null || this.inscept.id === "") {
            console.error(`Symbol ${this.node[' INFO ']} 未設定ID`);
            return;
        }

        let singleData = this.inscept.singleInscept;

        if (singleData.nomralNode) singleData.nomralNode.active = false;
        if (singleData.moveNode) singleData.moveNode.active = false;
        if (singleData.winNode) singleData.winNode.active = false;
        if (singleData.stopNode) singleData.stopNode.active = false;
        if (singleData.noWinNode) singleData.noWinNode.active = false;

        this._stateData[TYPE_STATE.NORMAL] = { 'node': singleData.nomralNode, 'spine': this.inscept.spineInscept.normalAnimation };
        this._stateData[TYPE_STATE.MOVE] = { 'node': singleData.moveNode, 'spine': this.inscept.spineInscept.moveAnimation };
        this._stateData[TYPE_STATE.WIN] = { 'node': singleData.winNode, 'spine': this.inscept.spineInscept.winAnimation };
        this._stateData[TYPE_STATE.STOP] = { 'node': singleData.stopNode, 'spine': this.inscept.spineInscept.stopAnimation };
        this._stateData[TYPE_STATE.NOWIN] = { 'node': singleData.noWinNode, 'spine': this.inscept.spineInscept.noWinAnimation };
        this._stateData['SPINE'] = this.inscept.spineInscept.spine?.getComponent(sp.Skeleton);

        ObjectPool.registerNode(this.inscept.id, this.node);
        this.node['id'] = this.symID;
        // console.log(this._stateData);
    }

    start() {
        this.normalState();
    }

    public setWheelPosition(x: number, y: number) {
        this._wheelPosition.x = x;
        this._wheelPosition.y = y;
    }

    public get getSkeleton() { return this.inscept.spineInscept.spine.getComponent<sp.Skeleton>(sp.Skeleton); }

    /**
     * 目前在滾輪的位置, 例如是第一條第三個 0,2
     * @returns Vec2
     */
    public getWheelPosition(): Vec2 { return this._wheelPosition; }

    protected showState(type: TYPE_STATE) {
        if (this._stateData[type]['node'] != null) {
            this._lastSingleStateNode = this._stateData[type]['node'];
            this._lastSingleStateNode.active = true;
        }

        if (this._stateData[type]['spine'] != "" && this._stateData['SPINE']) {
            this._stateData['SPINE'].animation = this._stateData[type]['spine'];
            this._lastStateNode = this._stateData['SPINE'];
        }
    }

    public normalState() {
        this.clearState();
        return this.showState(TYPE_STATE.NORMAL);
    }

    public moveState() {
        this.clearState();
        return this.showState(TYPE_STATE.MOVE);
    }

    /**
     * 播放得獎狀態
     * @param noSound 不播放得獎音效
     */
    public winState(noSound = false) {
        this.clearState();
        if (noSound == false) SoundManager.playSoundData(this.inscept.winAudio);
        return this.showState(TYPE_STATE.WIN);
    }

    public stopState() {

        this.clearState();
        return this.showState(TYPE_STATE.STOP);
    }


    /**
     * 特別破匡播放
     * @returns 
     */
    public showWinState() {

        this.clearState();

        if (this.inscept.spineInscept.spine == null) return;

        let performSym = instantiate(this.node);
        let payruleContainer: Node = (this.machine.payTable as PayTable4500).paylineContainer;
        let worldPos = this.node.getWorldPosition();
        let spine: sp.Skeleton = performSym.getComponent(Symbol).getSkeleton;

        payruleContainer.addChild(performSym);
        payruleContainer.parent.active = true;
        performSym.setParent(payruleContainer);
        performSym.setWorldPosition(worldPos);
        performSym.active = true;
        spine.setAnimation(0, 'play', false);

        this.machine.payTable.node.active = true;
        spine.setCompleteListener((entry: sp.spine.TrackEntry) => { performSym.destroy() });

    }

    public getAnimationDuration(animation:string):number{
        let duration:number = 0;
        let skeleton = this.inscept.spineInscept.spine.getComponent<sp.Skeleton>( sp.Skeleton );
        if ( skeleton ) {
            duration = Utils.getAnimationDuration( skeleton, animation );
        }
        return duration ;
    }

    public noWinState() {
        this.clearState();
        return this.showState(TYPE_STATE.NOWIN);
    }
    public clearState() {
        if (this._lastSingleStateNode) this._lastSingleStateNode.active = false;
        return;
    }
}

