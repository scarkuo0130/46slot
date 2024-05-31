import { _decorator, Component, Node, CurveRange, tween, EventTarget } from 'cc';
import { _StartRollingType, wheelModule } from '../_wheelInterface';
import { Utils, CurveRangeProperty } from '../../../../../utils/Utils';
const { ccclass, property } = _decorator;

/**
 * 數值設定啟動滾輪
 */
@ccclass('StartRolling2')
export class StartRolling2 extends wheelModule implements _StartRollingType {
    @property({displayName: '上抬的秒數', tooltip: '上抬的秒數', step: 0.1, min:0, max:10 })
    public preRollingMoveUpDuration: number = 0.5

    @property({displayName: '上抬的高度', tooltip: '上抬高度', step: 1 })
    public preRollingMoveValue: number = 70;

    @property({type: CurveRangeProperty, displayName: '動態曲線', tooltip: '動態曲線'})
    public curve: CurveRangeProperty = new CurveRangeProperty();

    async startRolling() {

        let wheel = this.wheel;                                     // 取得滾輪
        let lastSymbolData = wheel.lastSymbolData;                  // 取得最後一個 Symbol
        let container    = wheel.container;                         // 取得滾輪容器
        let moveUp       = this.preRollingMoveValue;                // 取得上抬高度
        let duration     = this.preRollingMoveUpDuration;           // 取得上抬秒數
        let curve        = this.curve;                              // 取得動態曲線
        let pos          = container.position;                      // 取得滾輪位置
        let movePos      = pos.clone();                             // 複製滾輪位置
        let easing : any = CurveRangeProperty.getEasing(curve);     // 取得動態曲線
        let endEvent     = new EventTarget();                       // 建立事件
        movePos.y += moveUp;                                        // 設定上抬高度

        if ( lastSymbolData == null ) {
            let lastIdx = wheel.heightIdxType[1];                   // 補上最後一顆 Symbol
            wheel.putSymbol(wheel.randomSymbol(), lastIdx);
        }
        
        tween(container).to(duration, { position: movePos }, { easing:easing, onComplete: () => { endEvent.emit('done'); } }).start();
        return await Utils.delayEvent(endEvent, 'done');
    }
}

