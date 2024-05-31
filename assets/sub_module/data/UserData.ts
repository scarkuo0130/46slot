export class UserData {

    protected _account: string;
    public get account (): string {
        return this._account;
    }

    protected _agent_account: string;
    public get agent_account (): string {
        return this._agent_account;
    }

    protected _credit: number;
    public get credit (): number {
        return this._credit;
    }
    public set credit ( value: number ) {
        this._credit = value;
    }

    protected _currency: string;
    public get currency (): string {
        return this._currency;
    }

    public setData ( data: any ): void {
        console.log(data);
        
        this._account = data[ 'account' ];
        this._agent_account = data[ 'agent_account' ];
        this._credit = data[ 'credit' ];
        this._currency = data[ 'currency' ];
    }

}