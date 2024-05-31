export class EventTypes {
    public static readonly UPDATE_PROGRESS: string = 'UPDATE_PROGRESS';
    public static readonly START_GAME: string = 'START_GAME';
    public static readonly WEBSOCKET_OPEN: string = 'WEBSOCKET_OPEN';
    public static readonly WEBSOCKET_CLOSE: string = 'WEBSOCKET_CLOSE';
    public static readonly WEBSOCKET_ERROR: string = 'WEBSOCKET_ERROR';
    public static readonly WEBSOCKET_MESSAGE_RECEIVED: string = 'WEBSOCKET_MESSAGE_RECEIVED';
    public static readonly UPDATE_CREDIT: string = 'UPDATE_CREDIT';
    public static readonly GAME_STANDBY: string = 'GAME_STANDBY';
    public static readonly GAME_READY: string = 'GAME_READY';
    public static readonly GAME_PLAY: string = 'GAME_PLAY';
    public static readonly GAME_ENDING: string = 'GAME_ENDING';
    public static readonly BET_CONFIRMED: string = 'BET_CONFIRMED';
    public static readonly BET1_CASHOUT: string = 'BET1_CASHOUT';
    public static readonly BET2_CASHOUT: string = 'BET2_CASHOUT';
    public static readonly ALLOW_CASHOUT: string = 'ALLOW_CASHOUT';
    public static readonly SHOW_RESPONSE_MESSAGE: string = 'SHOW_RESPONSE_MESSAGE';
    public static readonly SHOW_TOTAL_WIN: string = 'SHOW_TOTAL_WIN';
}