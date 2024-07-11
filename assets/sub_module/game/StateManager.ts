import xstate from "xstate/dist/xstate.js";
import { HttpConstants, HttpRequest } from '../network/HttpRequest';
import { gameInformation } from './GameInformation';
import { playerInformation } from './PlayerInformation';
import { EventType } from '../game/Constants';
import { EventManager } from '../events/EventManager';

export enum SlotStates {
    IDLE = 'idle',
    SPIN = 'spin',
    PRTFORM = 'perform',
    ELIMINATE = 'eliminate',
    FALL = 'fall',
    FREE_GAME_IDLE = 'freeGameIdle',
    FREE_GAME_SPIN = 'freeGameSpin',
    FREE_GAME_ELIMINATE = 'freeGameEliminate',
    FREE_GAME_FALL = 'freeGameFall'
};

export enum SlotEvents {
    CLICK = 'click',
    FINISH_SPIN = 'finishSpin',
    START_CASCADING = 'startCascading',
    FINISH_ELIMINATE = 'finishEliminate',
    FINISH_FALL = 'finishFall',
    FINISH_CASCADING = 'finishCascading',
    START_FREE_GAME = 'startFreeGame',
    FINISH_FREE_GAME = 'finishFreeGame'
};

export class StateManager {
    //#region Singleton
    protected static _instance: StateManager;
    public static get instance () {
        if ( !StateManager._instance ) {
            StateManager._instance = new StateManager();
        }
        return StateManager._instance;
    }
    //#endregion

    slotMachine = xstate.Machine( {
        initial: SlotStates.IDLE,
        states: {
            [ SlotStates.IDLE ]: {
                on: {
                    [ SlotEvents.CLICK ]: {
                        target: SlotStates.SPIN,
                        actions: 'startSpin'
                    },
                    [ SlotEvents.START_FREE_GAME ]: {
                        target: SlotStates.FREE_GAME_IDLE,
                        actions: 'startFreeGame'
                    }
                }
            },
            [ SlotStates.SPIN ]: {
                on: {
                    [ SlotEvents.CLICK ]: {
                        target: SlotStates.IDLE,
                        actions: 'stopSpin'
                    },
                    [ SlotEvents.FINISH_SPIN ]: {
                        target: SlotStates.IDLE,
                        actions: 'finishSpin'
                    },
                    [ SlotEvents.START_CASCADING ]: {
                        target: SlotStates.ELIMINATE,
                        actions: 'startCascading'
                    }
                }
            },
            [ SlotStates.ELIMINATE ]: {
                on: {
                    [ SlotEvents.FINISH_ELIMINATE ]: {
                        target: SlotStates.FALL,
                        actions: 'finishEliminate'
                    },
                    [ SlotEvents.FINISH_CASCADING ]: {
                        target: SlotStates.IDLE,
                        actions: 'finishCascading'
                    }
                }
            },
            [ SlotStates.FALL ]: {
                on: {
                    [ SlotEvents.FINISH_FALL ]: {
                        target: SlotStates.ELIMINATE,
                        actions: 'finishFall'
                    }
                }
            },
            [ SlotStates.FREE_GAME_IDLE ]: {
                on: {
                    [ SlotEvents.CLICK ]: {
                        target: SlotStates.FREE_GAME_SPIN,
                        actions: 'startFreeGameSpin'
                    },
                    [ SlotEvents.FINISH_FREE_GAME ]: {
                        target: SlotStates.IDLE,
                        actions: 'finishFreeGame'
                    }
                }
            },
            [ SlotStates.FREE_GAME_SPIN ]: {
                on: {
                    [ SlotEvents.FINISH_SPIN ]: {
                        target: SlotStates.FREE_GAME_IDLE,
                        actions: 'finishFreeGameSpin'
                    },
                    [ SlotEvents.START_CASCADING ]: {
                        target: SlotStates.FREE_GAME_ELIMINATE,
                        actions: 'startFreeGameCascading'
                    }
                }
            },
            [ SlotStates.FREE_GAME_ELIMINATE ]: {
                on: {
                    [ SlotEvents.FINISH_ELIMINATE ]: {
                        target: SlotStates.FREE_GAME_FALL,
                        actions: 'finishFreeGameEliminate'
                    },
                    [ SlotEvents.FINISH_CASCADING ]: {
                        target: SlotStates.FREE_GAME_IDLE,
                        actions: 'finishFreeGameCascading'
                    }
                }
            },
            [ SlotStates.FREE_GAME_FALL ]: {
                on: {
                    [ SlotEvents.FINISH_FALL ]: {
                        target: SlotStates.FREE_GAME_ELIMINATE,
                        actions: 'finishFreeGameFall'
                    }
                }
            }
        }
    }, {
        actions: {
            startSpin: () => {
                this.sendSpinCommand();
                EventManager.instance.dispatchEvent( EventType.START_SPIN );
            },
            stopSpin: () => {
                EventManager.instance.dispatchEvent( EventType.STOP_SPIN );
            },
            finishSpin: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_SPIN );
            },
            startCascading: () => {
                EventManager.instance.dispatchEvent( EventType.START_CASCADING );
            },
            finishEliminate: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_ELIMINATE );
            },
            finishFall: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FALL );
            },
            finishCascading: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_CASCADING );
            },
            startFreeGame: () => {
                EventManager.instance.dispatchEvent( EventType.START_FREE_GAME );
            },
            startFreeGameSpin: () => {
                EventManager.instance.dispatchEvent( EventType.START_FREE_GAME_SPIN );
            },
            finishFreeGameSpin: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FREE_GAME_SPIN );
            },
            startFreeGameCascading: () => {
                EventManager.instance.dispatchEvent( EventType.START_FREE_GAME_CASCADING );
            },
            finishFreeGameEliminate: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FREE_GAME_ELIMINATE );
            },
            finishFreeGameFall: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FREE_GAME_FALL );
            },
            finishFreeGameCascading: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FREE_GAME_CASCADING );
            },
            finishFreeGame: () => {
                EventManager.instance.dispatchEvent( EventType.FINISH_FREE_GAME );
            }
        }
    } );

    slotService = xstate.interpret( this.slotMachine )
        .onTransition( ( state: any ) => {
            console.log( state.changed );
            console.log( state.value );
        } )
        .onDone( () => {

        } );

    async sendSpinCommand () : Promise<any> {
        let betCredit: number = gameInformation.lineBet * gameInformation.lineTotal * gameInformation.coinValue;
        let sendSpinData = {
            "command": HttpConstants.SPIN,
            "token": gameInformation.token,
            "data": {
                game_id: gameInformation.gameid,
                line_bet: gameInformation.lineBet,
                line_num: gameInformation.lineTotal,
                coin_value: gameInformation.coinValue,
                bet_credit: betCredit,
                buy_spin: playerInformation.isBuyFreeGame
            }
        };
        console.log(sendSpinData);
        let result = await HttpRequest.establishConnect( JSON.stringify( sendSpinData ) ).catch((error) => {
            cc.Dailog.errorMessage(error);
        });
        if ( result != 'success' ) return null;
        return result;
        
    }

    async sendBuySpinCommand(totalBet:number) : Promise<any> {
        
        let coinValue = totalBet / gameInformation.lineBet / gameInformation.lineTotal;
        let sendSpinData = {
            "command": HttpConstants.SPIN,
            "token": gameInformation.token,
            "data": {
                game_id: gameInformation.gameid,
                line_bet: gameInformation.lineBet,
                line_num: gameInformation.lineTotal,
                coin_value: coinValue,
                bet_credit: totalBet,
                buy_spin: 1,
            }
        };
        console.log(sendSpinData);
        let result = await HttpRequest.establishConnect( JSON.stringify( sendSpinData ) ).catch((error) => {
            cc.Dailog.errorMessage(error);
        });
        if ( result != 'success' ) return null;
        return result;
    }
};