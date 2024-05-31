import mobx from 'mobx/dist/mobx.cjs.production.min.js';

export class GameData {

    protected _gameId: number;
    public get gameId (): number {
        return this._gameId;
    }

    protected _line_bet: Array<number>;
    public get line_bet (): Array<number> {
        return this._line_bet;
    }

    protected _coin_value: Array<number>;
    public get coin_value (): Array<number> {
        return this._coin_value;
    }

    protected _line_total: number;
    public get line_total (): number {
        return this._line_total;
    }

    protected _line_available: Array<number>;
    public get line_available (): Array<number> {
        return this._line_available;
    }

    protected _line_bet_default_index: number;
    public get line_bet_default_index (): number {
        return this._line_bet_default_index;
    }

    protected _coin_value_default_index: number;
    public get coin_value_default_index (): number {
        return this._coin_value_default_index;
    }

    protected _win: number;
    public get win (): number {
        return this._win;
    }

    protected _big_win: number;
    public get big_win (): number {
        return this._big_win;
    }

    protected _super_win: number;
    public get super_win (): number {
        return this._super_win;
    }

    protected _mega_win: number;
    public get mega_win (): number {
        return this._mega_win;
    }

    protected _spin_mode: number;
    public get spin_mode (): number {
        return this._spin_mode;
    }

    protected _buy_spin: IBuySpin;
    public get buy_spin (): IBuySpin {
        return this._buy_spin;
    }

    protected _currency: string;
    public get currency (): string {
        return this._currency;
    }

    protected _min_bet: number;
    public get min_bet (): number {
        return this._min_bet;
    }

    protected _max_bet: number;
    public get max_bet (): number {
        return this._max_bet;
    }

    protected _default_bet: number;
    public get default_bet (): number {
        return this._default_bet;
    }

    @mobx.observable protected _status_command: IStatusCommand;
    public get status_command (): IStatusCommand {
        return this._status_command;
    }

    @mobx.observable protected _progress_command: IProgressCommand;
    public get progress_command (): IProgressCommand {
        return this._progress_command;
    }

    @mobx.observable protected _bet_confirmed1_command: IBetConfirmedCommand;
    public get bet_confirmed1_command (): IBetConfirmedCommand {
        return this._bet_confirmed1_command;
    }

    @mobx.observable protected _bet_confirmed2_command: IBetConfirmedCommand;
    public get bet_confirmed2_command (): IBetConfirmedCommand {
        return this._bet_confirmed2_command;
    }

    @mobx.observable protected _cash_out_command: ICashOutCommand;
    public get cash_out_command (): ICashOutCommand {
        return this._cash_out_command;
    }

    @mobx.observable protected _outcome_command: IOutcomeCommand;
    public get outcome_command (): IOutcomeCommand {
        return this._outcome_command;
    }

    @mobx.observable protected _history_command: IHistoryCommand;
    public get history_command (): IHistoryCommand {
        return this._history_command;
    }

    constructor () {
        mobx.makeObservable( this );
    }

    public setData ( data: any ): void {
        this._gameId = data[ 'gameId' ];
        this._line_bet = data[ 'line_bet' ];
        this._coin_value = data[ 'coin_value' ];
        this._line_total = data[ 'line_total' ];
        this._line_available = data[ 'line_available' ];
        this._line_bet_default_index = data[ 'line_bet_default_index' ];
        this._coin_value_default_index = data[ 'coin_value_default_index' ];
        this._win = data[ 'win' ];
        this._big_win = data[ 'big_win' ];
        this._super_win = data[ 'super_win' ];
        this._mega_win = data[ 'mega_win' ];
        this._spin_mode = data[ 'spin_mode' ];
        this._buy_spin = data[ 'buy_spin' ] as IBuySpin;
    }

    public setJoinCommand ( data: any ): void {
        this._currency = data.game_data.currency;
        this._min_bet = data.game_data.min_bet;
        this._max_bet = data.game_data.max_bet;
        this._default_bet = data.game_data.default_bet;
        this.setStatusCommand( data.status );
    }

    @mobx.action public setStatusCommand ( data: any ): void {
        this._status_command = data as IStatusCommand;
    }

    public setBetConfirmedCommand ( data: any, id: number ): void {
        if ( id === 1 ) {
            this._bet_confirmed1_command = data as IBetConfirmedCommand;
        } else if ( id === 2 ) {
            this._bet_confirmed2_command = data as IBetConfirmedCommand;
        }
    }

    @mobx.action public setProgressCommand ( data: any ): void {
        this._progress_command = data as IProgressCommand;
    }

    public setCashOutCommand ( data: any ): void {
        this._cash_out_command = data as ICashOutCommand;
    }

    public setOutcomeCommand ( data: any ): void {
        this._outcome_command = data as IOutcomeCommand;
    }

    public setHistoryCommand ( data: any ): void {
        this._history_command = data as IHistoryCommand;
    }
}

export interface IBuySpin {
    allow_buy: number;
    multiplier: number;
    limit_total: number;
}

export interface IStatusCommand {
    stage: string;
    betable: boolean;
    remaining_time: number;
    credit: number;
}

export interface IProgressCommand {
    multiplier: string;
    duration: number;
    mode: number;
}

export interface IBetting {
    id: number;
    bet: number;
    auto_cashout: number;
}

export interface IBetConfirmedCommand {
    betting: IBetting;
    change_credit: number;
    credit: number;
}

export interface IOutcome {
    id: number;
    bet: number;
    win: number;
    multiplier: string;
}

export interface ICashOutCommand {
    outcome: IOutcome;
    change_credit: number;
    credit: number;
}

export interface IOutcomeCommand {
    result: number;
    outcomes: IOutcome[];
    effect_credit: number;
    payout_credit: number;
    change_credit: number;
    credit: number;
}

export interface IHistoryCommand {
    data: number[];
}