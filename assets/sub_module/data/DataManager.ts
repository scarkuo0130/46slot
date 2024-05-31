import { AsyncDelegate, _decorator } from 'cc';
import { UserData } from './UserData';
import { GameData, IStatusCommand, IProgressCommand, ICashOutCommand, IOutcomeCommand, IHistoryCommand } from './GameData';
import { EventTypes } from '../events/EventTypes';
import { EventManager } from '../events/EventManager';
const { ccclass, property } = _decorator;

@ccclass( 'DataManager' )
export class DataManager {
    //#region Singleton
    protected static _instance: DataManager;
    public static get instance () {
        if ( !DataManager._instance ) {
            DataManager._instance = new DataManager();
        }
        return DataManager._instance;
    }
    //#endregion

    protected _userData: UserData;
    public get userData (): UserData {
        return this._userData;
    }

    protected _gameData: GameData;
    public get gameData (): GameData {
        return this._gameData;
    }

    public onCreditChange: AsyncDelegate<( credit: number ) => void>;
    public onJoinServer: AsyncDelegate<() => void>;

    protected _userCredit: number;
    public set userCredit ( value: number ) {
        this._userCredit = value;
        this.onCreditChange.dispatch( this._userCredit );
    }

    public static get getUserCredit() { return DataManager.instance._userCredit; }

    constructor () {
        this._userData = new UserData();
        this._gameData = new GameData();

        this.onCreditChange = new AsyncDelegate();
        this.onJoinServer = new AsyncDelegate();
    }

    public setUserData ( data: any ): void {
        this._userData.setData( data );
        this._userCredit = data[ 'credit' ];
    }

    public setGameData ( data: any ): void {
        this._gameData.setData( data );
    }

    public updataCredit ( value: number ): void {
        this._userCredit = value;
    }

    public parseMessage ( data: any ): void {
        let message = JSON.parse( data );
        if ( message.command === 'join' ) {
            if ( message.error_code === 0 ) {
                this._gameData.setJoinCommand( message.data[ 0 ] );
                //this.userCredit = this._gameData.status_command.credit;
                this.userCredit = message.data[ 0 ].credit as number;
                this.onJoinServer.dispatch();
            } else {
                EventManager.instance.dispatchEvent( EventTypes.SHOW_RESPONSE_MESSAGE, message.message );
            }
        } else if ( message.command === 'status' ) {
            this._gameData.setStatusCommand( message.data[ 0 ] );
            //if ( this._gameData.status_command ) {
            //    this.userCredit = this._gameData.status_command.credit;
            //}
        } else if ( message.command === 'bet_confirmed' ) {
            if ( message.error_code === undefined || message.error_code === 0 ) {
                if ( message.data[ 0 ] ) {
                    this._gameData.setBetConfirmedCommand( message.data[ 0 ], 1 );
                    if ( this._gameData.bet_confirmed1_command ) {
                        this.userCredit = this._gameData.bet_confirmed1_command.credit;
                        EventManager.instance.dispatchEvent( EventTypes.BET_CONFIRMED );
                    }
                }
                if ( message.data[ 1 ] ) {
                    this._gameData.setBetConfirmedCommand( message.data[ 1 ], 2 );
                    if ( this._gameData.bet_confirmed2_command ) {
                        this.userCredit = this._gameData.bet_confirmed2_command.credit;
                        EventManager.instance.dispatchEvent( EventTypes.BET_CONFIRMED );
                    }
                }
            } else {
                EventManager.instance.dispatchEvent( EventTypes.SHOW_RESPONSE_MESSAGE, message.message );
            }
        } else if ( message.command === 'progress' ) {
            this._gameData.setProgressCommand( message.data[ 0 ] );
            if ( this._gameData.progress_command && this._gameData.history_command ) {
                if ( this._gameData.progress_command.duration === 0 && this._gameData.progress_command.mode === 4 ) {
                    this._gameData.history_command.data.unshift( Number( this._gameData.progress_command.multiplier ) );
                }
            }
        } else if ( message.command === 'cashout' ) {
            if ( message.error_code === undefined || message.error_code === 0 ) {
                this._gameData.setCashOutCommand( message.data[ 0 ] );
            } else {
                EventManager.instance.dispatchEvent( EventTypes.SHOW_RESPONSE_MESSAGE, message.message );
            }
        } else if ( message.command === 'outcome' ) {
            this._gameData.setOutcomeCommand( message.data[ 0 ] );
            if ( this._gameData.outcome_command ) {
                this.userCredit = this._gameData.outcome_command.credit;
            }
        } else if ( message.command === 'history' ) {
            if ( message.error_code === 0 ) {
                this._gameData.setHistoryCommand( message );
            } else {
                EventManager.instance.dispatchEvent( EventTypes.SHOW_RESPONSE_MESSAGE, message.message );
            }
        }
    }

    public getStatusCommand (): IStatusCommand {
        return this._gameData.status_command;
    }

    public getProgressCommand (): IProgressCommand {
        return this._gameData.progress_command;
    }

    public getCashOutCommand (): ICashOutCommand {
        return this._gameData.cash_out_command;
    }

    public getOutcomeCommand (): IOutcomeCommand {
        return this._gameData.outcome_command;
    }

    public getHistoryCommand (): IHistoryCommand {
        return this._gameData.history_command;
    }
}