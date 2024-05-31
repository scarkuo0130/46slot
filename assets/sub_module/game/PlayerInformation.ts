import mobx from 'mobx/dist/mobx.cjs.production.min.js';

export class PlayerInformation {
    @mobx.observable Balance: number = 0;
    @mobx.observable Ruby: number = 0;
    @mobx.observable MemberID: number = 0;

    isBuyFreeGame: number = 0;

    constructor () {
        mobx.makeObservable( this );
    }

    @mobx.action setBalance ( coin: number ) {
        this.Balance = coin;
    }
};

export const playerInformation = new PlayerInformation;