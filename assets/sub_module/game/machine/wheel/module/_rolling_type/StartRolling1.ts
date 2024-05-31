import { _decorator, Component, Node, EventHandler } from 'cc';
import { _StartRollingType, wheelModule } from '../_wheelInterface';
import { Utils } from '../../../../../utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 使用事件呼叫啟動滾輪
 */
@ccclass('StartRolling1')
export class StartRolling1 extends wheelModule implements _StartRollingType {
    @property({ type: EventHandler, displayName: 'Function設定', tooltip: '啟動事件' })
    public spinEvent: EventHandler = new EventHandler();

    async startRolling() {
        return Utils.awaitEventHandler(this.spinEvent, this.wheel);
    }
}

