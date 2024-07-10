import { _decorator, Size, Node, Enum, sp } from 'cc';
import { Wheel } from '../../Wheel';
import { SimpleAudioClipData } from '../../SoundManager';
import { StartRolling1 } from './_rolling_type/StartRolling1';
import { StartRolling2 } from './_rolling_type/StartRolling2';
import { RollingType } from './_rolling_type/RollingType';
import { RollingType1 } from './_rolling_type/RollingType1';
const { ccclass, property } = _decorator;

/**
 * 啟動滾輪方式
 */
export enum START_ROLLING_TYPE {
    '無設定' = 0,
    '事件設定' = 1,
    '數值設定' = 2,
}

/**
 * 滾動方式
 */
export enum ROLLING_TYPE {
    '事件設定' = 0,  // RollingType
    '常態捲動' = 1, // RollingType1
    '整排捲動' = 2, // RollingType2
}

@ccclass('wheelModule')
export class wheelModule {

    protected _wheel: Wheel = null;

    public get wheel(): Wheel { return this._wheel; }

    public initProperty(wheel: Wheel): void {
        this._wheel = wheel;
    }

}

export interface _StartRollingType  {
    initProperty(wheel:Wheel): void;

    startRolling (): Promise<void>;
}


export interface _RollingType { 
    _isNearMiss: boolean;

    /** 預設屬性 */
    initProperty(wheel:Wheel): void;

    /** 持續滾動 */
    keepRolling(): Promise<void>;

    /** 定義盤面結果 */
    _result : any;

    /** 正在停輪 */
    _rollingStopping : boolean;

    /** 設定盤面結果 */
    setResult(result:any): void;

    /** 停止捲動 */
    stopRollingMove() :Promise<void>;

    nearMissStopRolling(result) : Promise<void>;
}


