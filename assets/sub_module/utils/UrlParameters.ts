export class UrlParameters {

    protected static GAME_ID: string = 'gameid';
    protected static LANGUAGE: string = 'lang';
    protected static TOKEN: string = 'token';
    protected static BET_RECORD_URL: string = 'betrecordurl';
    protected static HOME_URL: string = 'homeurl';
    protected static MODE: string = 'mode';
    protected static SERVER_URL: string = 'serverurl';
    protected static CURRENCY: string = 'currency';
    protected static B: string = 'b';
    protected static WS: string = 'ws';

    public static get gameId (): number {
        const id: string = this.getUrlParameter( this.GAME_ID );
        return parseInt( id );
    }

    public static get language (): string {
        let languageCode: string = this.getUrlParameter( this.LANGUAGE );
        if ( languageCode ) {
            languageCode = languageCode.toLocaleLowerCase( 'en' );
        } 
        return languageCode;
    }

    public static get token (): string {
        return this.getUrlParameter( this.TOKEN );
    }

    public static get betRecordUrl (): string {
        return this.getUrlParameter( this.BET_RECORD_URL );
    }

    public static get homeUrl (): string {
        return this.getUrlParameter( this.HOME_URL );
    }

    public static get mode (): string {
        return this.getUrlParameter( this.MODE );
    }

    public static get serverUrl (): string {
        return this.getUrlParameter( this.SERVER_URL );
    }

    public static get currency (): string {
        return this.getUrlParameter( this.CURRENCY );
    }

    public static get b (): string {
        return this.getUrlParameter( this.B );
    }

    public static get ws (): string {
        return this.getUrlParameter( this.WS );
    }

    protected static getUrlParameter ( name: string ): string {
        const locationURL: URL = new URL( window.location.href );
        return locationURL.searchParams.get( name );
    }
}