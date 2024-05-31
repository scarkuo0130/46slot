export const CONFIG: {
    PROBABILITY_SYMBOL_ID: Array<number>,
    PROBABILITY_SYMBOL_ID_FOR_NORMAL: Array<number>,
    PROBABILITY_SYMBOL_ID_FOR_SPECIFIX: Array<number>,
    NUM_REEL: {
        all: number,
        vertical: number,
        horizontal: number
    },
    SHOW_NUM_ROW: number,
    NUM_ROW: number,
    SYMBOL_WIDTH: number,
    SYMBOL_HEIGHT: number,
    SCATTER_SYMBOL: number,
    WILD_SYMBOL: number,
    ICE_WILD_SYMBOL: number,

    NORMAL_SCROLL_TIME: number,
    QUICK_SCROLL_TIME: number,
    TURBO_SCROLL_TIME: number,
    NEAR_WIN_SCROLL_TIME: number,

    NEAR_WIN_BETWEEN_REEL_TIME: number,

    NORMAL_START_INTERVAL_TIME: number,
    QUICK_START_INTERVAL_TIME: number,
    TURBO_START_INTERVAL_TIME: number,

    ACTIVATE_INSTANT_DISTANCE: number,
    ACTIVATE_SCROLL_UP_TIME: number,
    ACTIVATE_SCROLL_DOWN_TIME: number,

    REBOUND_DISTANCE: number,
    REBOUND_TIME: number,
    SLOW_DOWN_TIME_CONSTANT: number,
    DYNAMIC_FASTEST_SPEED: number,
    DYNAMIC_SLOWEST_SPEED: number,

    TURBO_SPEED_MULTIPLE: number,

    BLACKOUT_TIME: number,

    NORMAL: string,
    QUICK: string,
    TURBO: string,
    QUICK_STOP: string,
    CURRENT_SPIN_MODE: string,
} = {
    PROBABILITY_SYMBOL_ID: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
    PROBABILITY_SYMBOL_ID_FOR_NORMAL: [ 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 9 ],
    PROBABILITY_SYMBOL_ID_FOR_SPECIFIX: [ 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1 ],
    NUM_REEL: {
        all: 5,
        vertical: 5,
        horizontal: 0
    },
    SHOW_NUM_ROW: 3,
    //show num row + 上下兩排
    NUM_ROW: 3 + 2,
    SYMBOL_WIDTH: 140,
    SYMBOL_HEIGHT: 130,
    SCATTER_SYMBOL: 9,
    WILD_SYMBOL: 0,
    ICE_WILD_SYMBOL: 10,

    // 每一輪normal spin、quick spin移動的時間
    NORMAL_SCROLL_TIME: 0.4,

    QUICK_SCROLL_TIME: 0.3,
    // turbo spin移動的時間
    TURBO_SCROLL_TIME: 0.3,
    // 有near win的時候每一輪移動的時間
    NEAR_WIN_SCROLL_TIME: 0.7,

    // 有near win的話
    NEAR_WIN_BETWEEN_REEL_TIME: 700,

    /****** 每個模式每輪之間啟動的時間 ******/
    // normal spin
    NORMAL_START_INTERVAL_TIME: 200,
    // quick spin
    QUICK_START_INTERVAL_TIME: 100,
    // turbo spin
    TURBO_START_INTERVAL_TIME: 0,

    /****** 瞬間啟動(往上移動)的資訊 ******/
    // 瞬間啟動的距離
    ACTIVATE_INSTANT_DISTANCE: 15,
    // 往上移動的時間
    ACTIVATE_SCROLL_UP_TIME: 0.1,
    // 往下回到原始點的時間
    ACTIVATE_SCROLL_DOWN_TIME: 0.025,

    /****** 停輪之後彈跳的資訊 ******/
    // 彈跳的距離
    REBOUND_DISTANCE: 10,
    // 彈跳的時間
    REBOUND_TIME: 0.1,

    /****** near win放慢的資訊 ******/
    // near win慢慢停輪需要的常數
    SLOW_DOWN_TIME_CONSTANT: 450,
    // near win最快速度(原始速度)
    DYNAMIC_FASTEST_SPEED: 1,
    // near win最慢速度
    DYNAMIC_SLOWEST_SPEED: 0.3,

    // 快停的加速倍率
    TURBO_SPEED_MULTIPLE: 5,

    // 逐漸壓黑所需時間
    BLACKOUT_TIME: 0.1,

    /****** spin模式 ******/
    NORMAL: 'normal',
    QUICK: 'quick',
    TURBO: 'turbo',
    QUICK_STOP: 'quickStop',
    CURRENT_SPIN_MODE: '',
};

export enum EventType {
    UPDATE_PROGRESS = 'UpdateProgress',
    START_SPIN = 'StartSpin',
    STOP_SPIN = 'StopSpin',
    FINISH_SPIN = 'FinishSpin',
    START_CASCADING = 'StartCascading',
    FINISH_CASCADING = 'FinishCascading',
    FINISH_ELIMINATE = 'FinishEliminate',
    FINISH_FALL = 'FinishFall',
    DISAPPEAR_DYNAMIC_SYMBOL = 'DisappearDynamicSymbol',
    SYMBOL_FALL = 'SymbolFall',
    START_FREE_GAME = 'StartFreeGame',
    START_FREE_GAME_SPIN = 'StartFreeGameSpin',
    FINISH_FREE_GAME_SPIN = 'FinishFreeGameSpin',
    START_FREE_GAME_CASCADING = 'StartFreeGameCascading',
    FINISH_FREE_GAME_CASCADING = 'FinishFreeGameCascading',
    FINISH_FREE_GAME_ELIMINATE = 'FinishFreeGameEliminate',
    FINISH_FREE_GAME_FALL = 'FinishFreeGameFall',
    FINISH_FREE_GAME = 'FinishFreeGame'
};

export enum SpinMode {
    NONE = 0,
    QUICK = 1,
    TURBO = 2,
    NONE_TO_TURBO = 3
};

export type FallSymbol = {
    index: number,
    id: number
};