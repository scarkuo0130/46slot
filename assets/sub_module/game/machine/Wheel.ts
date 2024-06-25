import { _decorator, Vec2 } from 'cc';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { WheelLibrary } from './wheel/_wheelLibrary';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

/** 滾輪狀態 */
export const enum WHEEL_STATE {
    /** 一般靜止狀態 */
    STATE_NORMAL = 1,

    /** 滾動中 */
    STATE_ROLLING = 2,

    /** 滾動停止中 */
    STATE_STOPING = 3,

    /** 聽牌(放慢)中 */
    STATE_SPECIAL = 4,
}


@ccclass('Wheel')
@disallowMultiple(true)
@menu('SlotMachine/Reel/Wheel')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.bpiwkpq4ve6p')
export class Wheel extends WheelLibrary {

    /** 
     * @deprecated 即將廢棄
     * */
    protected get wheelHeightRange() { 
        let idxRange = this.heightIdxType;
        return new Vec2(idxRange[0], idxRange[1]);
    }

    protected _state: WHEEL_STATE = WHEEL_STATE.STATE_NORMAL;
    public get state(): WHEEL_STATE { return this._state; }
    protected changeState(state: WHEEL_STATE) {
        this._state = state;
        return this._state;
    }

    onLoad() {
        if (this.checkInscept() === false) {
            return;
        }

        this.initInscept();
    }

    protected start(): void {
        this.initNodeData();
        this.startPutSymbol();
    }

    private initNodeData() {
        
    }

    /**
     * 開始滾動呼叫事件，預留給外部呼叫
     */
    public async preStartSpin() {}

    /**
     * 持續滾動呼叫事件，預留給外部呼叫
     */
    public async spinDone() {}
    /**
     * 開始 Spin
     */
    public async Spin() {

        this.changeState(WHEEL_STATE.STATE_ROLLING);
        await this.preStartSpin();
        await this.keepSpin();
        this.changeState(WHEEL_STATE.STATE_STOPING);
        await this.spinDone();
        this.changeState(WHEEL_STATE.STATE_NORMAL);
    }


}

