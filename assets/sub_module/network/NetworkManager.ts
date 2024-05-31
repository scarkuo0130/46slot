import { _decorator } from 'cc';
import { HTTP_METHODS, HttpRequestUtils, IPayload } from './HttpRequestUtils';
import { WebsocketUtils } from './WebsocketUtils';
import { ErrorCodeConfig } from './ErrorCodeConfig';
import { ConfigUtils } from '../utils/ConfigUtils';
import { NetworkApi } from './NetworkApi';
import { DataManager } from '../data/DataManager';
import { UrlParameters } from '../utils/UrlParameters';
import { EventTypes } from '../events/EventTypes';
import { EventManager } from '../events/EventManager';
const { ccclass, property } = _decorator;

@ccclass( 'NetworkManager' )
export class NetworkManager {
    //#region Singleton
    protected static _instance: NetworkManager;
    public static get instance () {
        if ( !NetworkManager._instance ) {
            NetworkManager._instance = new NetworkManager();
        }
        return NetworkManager._instance;
    }
    //#endregion

    protected httpRequest: HttpRequestUtils;

    protected websocket: WebsocketUtils;

    protected errorCodeConfig: ErrorCodeConfig;


    constructor () {
        this.httpRequest = new HttpRequestUtils();
        this.httpRequest.onErrorDelegate.add( this.onHttpError.bind( this ) );

        this.websocket = new WebsocketUtils();
        this.websocket.onOpenDelegate.add( this.onWebsocketOpen.bind( this ) );
        this.websocket.onMessageDelegate.add( this.onWebsocketMessageReceived.bind( this ) );
        this.websocket.onCloseDelegate.add( this.onWebsocketClose.bind( this ) );
        this.websocket.onErrorDelegate.add( this.onWebsocketError.bind( this ) );

        this.errorCodeConfig = ConfigUtils.getConfig<ErrorCodeConfig>( ErrorCodeConfig );
    }

    protected onHttpError ( errorCode: number ): void {
        if ( errorCode === -1 ) {
            // TODO:
        }
    }

    protected checkErrorCode ( response: IResponseData ): void {
        if ( response.error_code !== 0 ) {
            if ( this.errorCodeConfig.retryErrorCodes.includes( response.error_code ) ) {
                // TODO: retry...
            } else if ( this.errorCodeConfig.closeAndContinueCodes.includes( response.error_code ) ) {
                // TODO: show error dialog with close button
            } else {
                // TODO: show error dialog
            }
        }
    }

    public async sendGetGameData (): Promise<void> {
        const content: any = {
            command: NetworkApi.GET_GAME_DATA,
            token: UrlParameters.token,
            data: {
                game_id: UrlParameters.gameId
            }
        };

        const payload: IPayload = {
            url: UrlParameters.serverUrl,
            method: HTTP_METHODS.POST,
            content: JSON.stringify( content )
        };

        await this.httpRequest.sendRequest( payload, this.onGetGameDataReceived );
    }

    protected onGetGameDataReceived ( response: IResponseData ): void {
        console.log( '[NetworkManager] onGetGameDataReceived =>', response );
        DataManager.instance.setGameData( response.data );
    }

    public async getUserData (): Promise<void> {
        const content: IRequestData = {
            command: NetworkApi.GET_USER_DATA,
            token: UrlParameters.token,
            data: {}
        };

        const payload: IPayload = {
            url: UrlParameters.serverUrl,
            method: HTTP_METHODS.POST,
            content: JSON.stringify( content )
        };

        await this.httpRequest.sendRequest( payload, this.onGetUserDataReceived );
    }

    protected onGetUserDataReceived ( response: IResponseData ): void {
        console.log( '[NetworkManager] onGetUserDataReceived =>', response );
        DataManager.instance.setUserData( response.data );
    }


    public connect ( url: string ): void {
        this.websocket.connect( url );
    }

    public sendMessage ( data: any ): void {
        this.websocket.send( data );
    }

    public close ( code?: number, reason?: string ): void {
        this.websocket.close( code, reason );
    }

    protected onWebsocketMessageReceived ( data: any ): void {
        console.log( '[NetworkManager] onWebsocketMessageReceived =>', data );
        DataManager.instance.parseMessage( data );
        EventManager.instance.dispatchEvent( EventTypes.WEBSOCKET_MESSAGE_RECEIVED );
    }

    protected onWebsocketOpen (): void {
        console.log( '[NetworkManager] onWebsocketOpen' );
        EventManager.instance.dispatchEvent( EventTypes.WEBSOCKET_OPEN );
    }

    protected onWebsocketError (): void {
        console.log( '[NetworkManager] onWebsocketError' );
        EventManager.instance.dispatchEvent( EventTypes.WEBSOCKET_ERROR );
    }

    protected onWebsocketClose (): void {
        console.log( '[NetworkManager] onWebsocketClose' );
        EventManager.instance.dispatchEvent( EventTypes.WEBSOCKET_CLOSE );
    }

}

export interface IRequestData {
    command: string;
    token: string;
    data: any;
}

export interface IResponseData {
    command: string;
    data: any;
    error_code: number;
    message?: string;
}