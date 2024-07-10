import { _decorator, Component, Node, EventHandler } from 'cc';
import { Wheel } from '../../../Wheel';
import { _RollingType, wheelModule } from '../_wheelInterface';
import { Utils } from '../../../../../utils/Utils';

const { ccclass, property } = _decorator;

/**
 * 滾動捲軸: 事件設定
 */
@ccclass('RollingType')
export class RollingType extends wheelModule implements _RollingType {

    @property({ type: EventHandler, displayName: 'Function設定', tooltip: '滾輪事件' })
    public spinEvent: EventHandler = new EventHandler();

    @property({ type: EventHandler, displayName: 'Function設定', tooltip: '停輪事件' })
    public stopRollingEvent : EventHandler = new EventHandler();

    protected get propertys() { return this.wheel.rollingInspect.rolling; }

    /**
     * 使用者自定義的滾動事件
     * @param wheel 
     * @returns 
     * 
     * @example
     * 使用者自定義的滾動事件 function 須符合格式
     * public async `functionName`(wheel: Wheel): Promise<void> {
     *    // do something
     * }
     * 此 function 可完成自定義的滾輪方式
     * 在事件執行完成 await 後才會往下執行
     */
    public async keepRolling(): Promise<void> { return Utils.awaitEventHandler(this.propertys.spinEvent, this.wheel); }

    /**
     * 停止捲動
     * @returns 
     */
    public async stopRollingMove(): Promise<void> { return Utils.awaitEventHandler(this.propertys.stopRollingEvent, this.wheel); }

    public async nearMissStopRolling() : Promise<void> { return Utils.awaitEventHandler(this.propertys.stopRollingEvent, this.wheel); }

    protected _result: any;
    
    // 設定盤面結果
    public setResult(result: any): void { this._result = result;}

    /** 正在停輪 */
    protected _rollingStopping : boolean;

    public stopRolling(result) {
        this.setResult(result);
        this.propertys._rollingStopping = true;
    }
}
