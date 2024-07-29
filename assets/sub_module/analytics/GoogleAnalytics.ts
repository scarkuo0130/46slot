import { _decorator } from 'cc';
import { DEBUG, PREVIEW } from 'cc/env';
import { ConfigUtils } from '../utils/ConfigUtils';
import { GAConfig } from './GAConfig';
import { UrlParameters } from '../utils/UrlParameters';
import { gameInformation } from '../game/GameInformation';
const { ccclass, property } = _decorator;

@ccclass( 'GoogleAnalytics' )
export class GoogleAnalytics {
    //#region Singleton
    protected static _instance: GoogleAnalytics;
    public static get instance () {
        if ( !GoogleAnalytics._instance ) {
            GoogleAnalytics._instance = new GoogleAnalytics();
        }
        return GoogleAnalytics._instance;
    }
    //#endregion

    public static readonly GA_EVENT: string = 'GA_EVENT';

    protected commonCode: Array<string>;
    protected allowGameId: Array<number>;
    protected gaCode: Array<string>;

    protected gaConfig: GAConfig;

    protected constructor () {
        //
    }

    public initialize (): void {
        this.gaConfig = ConfigUtils.getConfig<GAConfig>( GAConfig );
        this.commonCode = ( UrlParameters.b === 'iqazwsxi' ) ? this.gaConfig.commonCode : [];
        this.allowGameId = this.gaConfig.allowGameId;
        this.gaCode = [];
        this.gaCode = this.gaCode.concat( this.commonCode );

        const gameID = gameInformation.gameid;
        let codes: any = this.getGACode();
        if ( codes[ gameID ] ) {
            this.gaCode.push( codes[ gameID ] );
        }
        this.addGoogleAnalytics();
    }

    protected getGACode (): any {
        if ( PREVIEW ) {
            return this.gaConfig.DEVELOPMENT;
        } else if ( DEBUG ) {
            return this.gaConfig.LAB;
        } else {
            /*
            switch ( UrlParameters.b ) {
                case 'iqazwsxi':
                    return this.gaConfig.ID_IDN;

                case 'pqazwsxm':
                    return this.gaConfig.PH_MW;

                case 'tqazwsxx':
                    return this.gaConfig.TH_X2;
                case 'iqazwsxd':
                    return this.gaConfig.PH_MW;
            }*/
            return this.gaConfig.ID_IDN;
            return [];
        }
    }

    protected addGoogleAnalytics (): void {
        for ( let i = 0; i < this.gaCode.length; i++ ) {
            let head: HTMLHeadElement = document.getElementsByTagName( 'head' )[ 0 ];
            let gaCodeSrc: HTMLScriptElement = document.createElement( 'script' );
            let gaCodeContent: HTMLScriptElement = document.createElement( 'script' );
            head.appendChild( gaCodeSrc );
            head.appendChild( gaCodeContent );

            gaCodeSrc.async = true;
            gaCodeSrc.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.gaCode[ i ];
            gaCodeContent.innerHTML = 'window.dataLayer = window.dataLayer || [];\n' +
                'function gtag() { dataLayer.push( arguments ); }\n' +
                'gtag( "js", new Date() );\n' +
                `gtag( "config", "${ this.gaCode[ i ] }" );\n` +
                `window.addEventListener( '${ GoogleAnalytics.GA_EVENT }', (event) => { gtag( event.detail.event, event.detail.message, event.detail.other ); });`;
        }
    }

    public addGtag ( data: IGAEvent ): void {
        if ( this.allowGameId.includes( UrlParameters.gameId ) ) {
            let eventData: CustomEventInit<IGAEvent> = {
                detail: {
                    event: data.event,
                    message: data.message,
                    other: data.other ?? this.getDefaultGTagData()
                }
            };
            window.dispatchEvent( new CustomEvent( GoogleAnalytics.GA_EVENT, eventData ) );
        }
    }

    protected getDefaultGTagData (): any {
        let codes: any = this.getGACode();
        return {
            'send_to': codes[ UrlParameters.gameId ],
            'event_category': 'click'
        }
    }
}

export interface IGAEvent {
    event: string;
    message: string;
    other?: any;
}