import { _decorator, CCInteger, Component, Node, EventTarget, tween, Vec3 } from 'cc';
import { _RollingType, wheelModule } from '../_wheelInterface';
import { SPIN_MODE } from '../../../GameType';
import { Wheel } from '../../../Wheel';
import { ObjectPool } from '../../../../ObjectPool';
import { Utils, TWEEN_EASING_TYPE, CurveRangeProperty } from '../../../../../utils/Utils';
import { t } from 'xstate';
const { ccclass, property } = _decorator;

/**
 * 滾動捲軸: 常態設定
 * 最常見的從上往下滾動
 */
@ccclass('RollingType1')
export class RollingType1 extends wheelModule implements _RollingType {
    @property({displayName: '滾動速度', tooltip: '越大越快', min: 1, max: 10000, step: 1, group: { name: 'Normal' }})
    public rollingSpeed_n: number = 500;

    @property({displayName: '滾動速度', tooltip: '越大越快', min: 1, max: 10000, step: 1, group: { name: 'Quick' }})
    public rollingSpeed_q: number = 800;

    @property({displayName: '滾動速度', tooltip: '越大越快', min: 1, max: 10000, step: 1, group: { name: 'Turbo' }})
    public rollingSpeed_t: number = 1000;

    @property({ type: CurveRangeProperty, displayName: '停輪下壓曲線', group: { name: '停輪設定', id: 1}})
    public rollingDownCurve: CurveRangeProperty = new CurveRangeProperty();

    @property({displayName: '停輪下壓指數', tooltip: '下壓高度=(速度/10000)*停輪下壓指數*Symbol高度', min:0, max:10, step:0.1, group: { name: '停輪設定', id: 1}})
    public rollingDownMultiple: number = 1;

    @property({ type: CurveRangeProperty, displayName: '回彈曲線', group: { name: '停輪設定', id: 1}})
    public rollingBackCurve: CurveRangeProperty = new CurveRangeProperty();

    /** 滾動速度 */
    public rollingSpeed = {
        [SPIN_MODE.NORMAL_MODE] : 0,
        [SPIN_MODE.QUICK_MODE]  : 0,
        [SPIN_MODE.TURBO_MODE]  : 0,
    }

    /**
     * 取得 Spin 速度
     * @returns 
     */
    protected get getSpinSpeed() {
        const speed = this.rollingSpeed[this.wheel.reel.spinMode];
        return speed;
    }

    /** 是否為 NearMiss */
    public _isNearMiss: boolean = false;

    /** 定義盤面結果 */
    public _result: any;
    
    // 設定盤面結果
    public setResult(result: any): void { this.propertys._result = result;}

    /** 接收到停輪指令 */
    public _rollingStopping : boolean;

    /** 取得模組資料 */
    protected get propertys() { return this.wheel.rollingInspect.rolling1; }

    /** 是否停止捲動補充盤面完成 */
    public _isStoppingFillDone: boolean = false;

    /**
     * 初始化滾動捲軸屬性
     * @from _wheelLibrary.ts class RollingInscept()
     * @param wheel 
     */
    
    public initProperty(wheel: Wheel) { 
        super.initProperty(wheel);
        this.rollingSpeed = {
            [SPIN_MODE.NORMAL_MODE] : wheel.rollingInspect.rolling1.rollingSpeed_n,
            [SPIN_MODE.QUICK_MODE]  : wheel.rollingInspect.rolling1.rollingSpeed_q,
            [SPIN_MODE.TURBO_MODE]  : wheel.rollingInspect.rolling1.rollingSpeed_t,
        }
    }

    /**
     * 重設滾輪屬性
     */
    protected reset() {
        this.propertys._isNearMiss = false;
        this.propertys._isStoppingFillDone = false;
        this.propertys._rollingStopping = false;
        this.propertys._result = null;
    }

    /**
     * 持續滾動捲軸
     * @param wheel 
     * @returns 
     */
    public async keepRolling(): Promise<void> {
        this.reset();               // 重設滾輪屬性
        while (true) {

            this.fillSymbol();       // 往上補充 Symbol
            await this.moveDown();  // 往下捲動滾輪
            this.refreshSymbol();   // 移動完成後更新 Symbol

            if ( this.propertys._isStoppingFillDone ) break;
        }

        this.wheel.allNormalSymbol(); // 設定所有 Symbol 取消模糊狀態
        // 停止捲動，回彈動態
        await this.stopRollingMove();
        this.wheel.allDropSymbol();   // 設定所有 Symbol 為 Drop 狀態
    }

    /**
     * 往上補充 Symbol
     */
    public fillSymbol() {
        let wheel     = this.wheel;                 // 取得滾輪
        let propertys = this.propertys;             // 取得滾輪屬性
        let len       = wheel.wheelLength;          // 取得滾輪長度
        let fillSize   = -len;                       // 計算補充大小
        let isStoping = propertys._rollingStopping;  // 取得是否停止捲動
        let result    = propertys._result;          // 取得盤面結果

        if ( isStoping ) {                          // 如果正在停輪，放入盤面結果
            for(let i=-1; i>=fillSize; i--) {
                let idx = i + len;
                let symbol = ObjectPool.Get(result[idx]);
                wheel.putSymbol(symbol, i);
            }
            this.propertys._isStoppingFillDone = true; // 設定停輪補充完成，可以停輪了

        } else {                                      // 如果不是停輪，隨機放入 Symbol
            for(let i=-1; i>=fillSize; i--) {
                let symbol = wheel.randomSymbol();
                if ( wheel.getSymbol(i) != null ) continue;
                wheel.putSymbol(symbol, i);
            }
        }

        wheel.allBlurSymbol();
    }

    protected async nearMissStopRolling(result:any) {
        console.log('nearMissStopRolling', result);
        return await Utils.delay(10000);
    }

    /**
    * 往下捲動滾輪
    */
    protected async moveDown() {
        let wheel         = this.wheel;                     // 取得滾輪
        let len           = wheel.wheelLength;              // 取得滾輪長度
        let toIdx         = len + Math.floor(len/2);         // 計算目標位置
        let toPos         = wheel.getSymbolPutPos(toIdx);   // 計算目標位置
        let container     = wheel.container;                // 取得Symbol容器
        let moveSpeed     = this.getSpinSpeed;              // 取得滾動速度
        let moveDoneEvent = new EventTarget();              // 建立滾動完成事件
        
        let updateEvent = (wheel, dt) => {                  // 滾動更新事件
            let pos = container.position.clone();
            pos.y -= moveSpeed * dt;
            container.setPosition(pos);

            if ( pos.y <= toPos.y ) {                       // 到達目標位置
                container.setPosition(toPos);
                moveDoneEvent.emit('done');                 // 觸發滾動完成事件
                wheel.propertys.updateEvent = null;         // 移除更新事件
            }
        };

        wheel.startUpdate(updateEvent);
        return await Utils.delayEvent(moveDoneEvent, 'done');
    }

    /**
     * 移動完成後更新 Symbol
     * @param wheel 
     */
    protected refreshSymbol() {
        let wheel         = this.wheel;                 // 取得滾輪
        let len           = wheel.wheelLength;          // 取得滾輪長度
        let symbolData    = wheel.propertys.symbolData; // 取得目前 Symbol 資料
        let keys          = Object.keys(symbolData);    // 取得 Symbol 資料的 key
        let newSymbolData = {};                         // 建立新的 Symbol 資料

        wheel.container.setPosition(0,0,0);             // 重設滾輪位置
        for(let i=0; i<keys.length; i++) {
            let idx = parseInt(keys[i]);
            let toIdx = idx + len;
            let data = symbolData[idx];
            let symbol = data['symbol'];

            if ( !data || !symbol ) continue;
            if ( idx <= 0 ) {                           // 設定保留的 Symbol
                newSymbolData[toIdx] = data;
                let pos = wheel.getSymbolPutPos(toIdx);
                symbol.setPosition(pos);
            } else {                                    // 回收不要的 Symbol
                ObjectPool.Put(data['id'].toString(), symbol);
            }
        }

        wheel.propertys.symbolData = newSymbolData;
    }

    /**
     * 停止滾動捲軸
     * @param wheel 
     */
    protected async stopRollingMove() {
        let wheel            = this.wheel;
        let propertys        = this.propertys;
        let moveSpeed        = this.getSpinSpeed;                                        // 取得滾動速度
        let multiple         = propertys.rollingDownMultiple;                            // 取得下壓倍數
        let symbolSize       = wheel.getSymbolSize();                                    // 取得 Symbol 大小
        let downHeight       = symbolSize.height * moveSpeed / 10000 * multiple;         // 計算下壓高度
        let toPos            = new Vec3(0, -downHeight, 0);                              // 計算下壓位置
        let sec              = downHeight / (1/60 * moveSpeed) / 60 * 7.5;               // 計算下壓時間
        let easing     : any = CurveRangeProperty.getEasing(propertys.rollingDownCurve); // 取得下壓曲線
        let easingBack : any = CurveRangeProperty.getEasing(propertys.rollingBackCurve); // 取得回彈曲線
        let endEvent         = new EventTarget();                                        // 建立結束事件

        tween(wheel.container)
            .to(sec, { position: toPos }, { easing: easing })                            // 下壓
            .to(sec, { position: Vec3.ZERO }, { easing: easingBack, onComplete: () => { endEvent.emit('done'); }}) // 回彈
            .start();
        
        return await Utils.delayEvent(endEvent, 'done');
    }

    /**
     * 停止滾動
     * @param result 盤面結果
     */
    public stopRolling(result) {
        this.setResult(result);
        this.propertys._rollingStopping = true;
    }


}

