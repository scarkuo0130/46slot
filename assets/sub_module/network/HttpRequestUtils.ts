import { AsyncDelegate, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'HttpRequestUtils' )
export class HttpRequestUtils {

    public onErrorDelegate: AsyncDelegate<( errorCode: number ) => void>;

    protected xhr: XMLHttpRequest;

    constructor () {
        this.onErrorDelegate = new AsyncDelegate();

        this.xhr = new XMLHttpRequest();
        this.xhr.responseType = 'json';
        this.xhr.timeout = 4 * 60 * 1000;
    }

    public sendRequest ( data: IPayload, callback: Function ): Promise<void> {
        return new Promise( ( resolve, reject ) => {
            this.xhr.open( data.method, data.url );
            this.xhr.onload = () => {
                if ( this.xhr.status === 404 ) {
                    reject();
                    this.onErrorDelegate.dispatch( -1 );
                } else {
                    let response: any = this.xhr.response;
                    if ( response && response.data ) {
                        callback( response );
                        resolve();
                    } else {
                        reject();
                        this.onErrorDelegate.dispatch( -1 );
                    }
                }
            };
            this.xhr.onerror = () => {
                reject();
                this.onErrorDelegate.dispatch( -1 );
            };
            this.xhr.send( data.content );
        } );
    }

}

export interface IPayload {
    url: string;
    method: HTTP_METHODS;
    content: string;
}

export enum HTTP_METHODS {
    POST = 'POST',
    GET = 'GET'
}
