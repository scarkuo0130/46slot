import { _decorator, Component, Node, Enum, CurveRange } from 'cc';
import { Utils } from '../../utils/Utils';
const { ccclass, property } = _decorator;


export enum REEL_STATE {
    NORMAL_STATE = 0,
    SPINING_STATE = 1,
    STOPING_STATE = 2,
    WIN_STATE = 3,
}

export enum SPIN_MODE {
    NORMAL_MODE = 0,
    QUICK_MODE = 1,
    TURBO_MODE = 2,
}
