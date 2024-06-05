import { EventHandler, JsonAsset, resources, CurveRange, _decorator, Enum, EventTarget, sp } from "cc";
import { PREVIEW } from "cc/env";
import { Game } from "../game/Game";
import { Config, GameConfig } from '../game/GameConfig';
import { gameInformation } from '../game/GameInformation';
const { ccclass, property } = _decorator;

export namespace _utilsDecorator {

    /**
     * 定義為只有在開發站才會執行的函式
     * @param value 
     * @returns 
     */
    export function isDevelopFunction ( value: boolean = true ) {
        return function ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
            if ( Utils.isDevelopment() === true ) return;
            if ( value === false ) return;
            target[ propertyKey ] = () => { };
            console.log = () => { };
        };
    }
}

export class Utils {

    public static Random ( min: number = 0, max: number ): number {
        return Math.floor( Math.random() * ( max - min ) ) + min;
    }

    public static add ( x: number, y: number ): number {
        return ( x * 1000 + y * 1000 ) / 1000;
    }

    /**
     * Get all keys from enum
     * @param enumType 
     * @returns 
     */
    public static getEnumKeys ( enumType: any ): Array<string> {
        return Object.keys( enumType ).filter( item => isNaN( Number( item ) ) );
    }

    protected static encoder: TextEncoder = new TextEncoder();
    /**
     * Encode String to ArrayBuffer
     * @param text 
     * @returns 
     */
    public static stringToArrayBuffer ( text: string ): ArrayBuffer {
        return Utils.encoder.encode( text );
    }

    protected static decoder: TextDecoder = new TextDecoder();
    /**
     * Decode ArrayBuffer to String
     * @param data 
     * @returns 
     */
    public static arrayBufferToString ( data: ArrayBuffer ): string {
        return Utils.decoder.decode( data );
    }

    /**
     * Convert String to Binary data
     * @param text 
     * @returns 
     */
    public static stringToBinary ( text: string ): string {
        return text.split( '' ).map( ( char ) => char.charCodeAt( 0 ).toString( 2 ) ).join( ' ' );
    }

    /**
     * Convert Binary data to String
     * @param binaryData 
     * @returns 
     */
    public static binaryToString ( binaryData: string ): string {
        return String.fromCharCode( ...binaryData.split( ' ' ).map( binary => parseInt( binary, 2 ) ) );
    }

    /**
     * Convert the number text to unit
     * @param value 
     * @param allowThousand 
     * @returns 
     */
    public static changeUnit ( value: number | string, allowThousand: boolean = false ): string {
        const THOUSAND: number = 1000;
        const MILLION: number = 1000000;
        const BILLION: number = 1000000000;

        let item: number = ( typeof value === 'string' ) ? parseInt( value ) : value;
        if ( item / BILLION >= 1 ) {
            return Utils.toFixedNoRound( item / BILLION, 2 ) + 'B';
        } else if ( item / MILLION >= 1 ) {
            return Utils.toFixedNoRound( item / MILLION, 2 ) + 'M';
        } else if ( allowThousand && item / THOUSAND >= 1 ) {
            return Utils.toFixedNoRound( item / THOUSAND, 2 ) + 'K';
        } else {
            let regex: RegExp = new RegExp( '^-?\\d+(?:\.\\d{0,' + ( -1 ) + '})?' );
            let result: string = item.toString().match( regex )[ 0 ];
            return result.replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );
        }
    }

    /**
     * Fixed the digit without rounding the value
     * @param value 
     * @param fixed 
     * @returns 
     */
    public static toFixedNoRound ( value: number | string, fixed: number ): string {
        let item: number = ( typeof value === 'string' ) ? parseInt( value ) : value;
        let re = new RegExp( '^-?\\d+(?:\.\\d{0,' + ( fixed || -1 ) + '})?' );
        let itemString = item.toFixed( fixed );
        let rt = itemString.match( re )[ 0 ];
        return rt.replace( /(\d)(?=(\d{3})+(?!\d))/g, '$1,' );
    }

    /**
     * Replace the `{0}...{1}` to args
     * @param target 
     * @param args 
     * @returns 
     */
    public static formatString ( target: string, ...args: string[] ): string {
        let result: string = target;
        for ( let i = 0; i < args.length; i++ ) {
            result = result.replace( '{' + i + '}', args[ i ] );
        }
        return result;
    }

    /**
     * Convert the string value with comma to number
     * @param value 
     * @returns 
     */
    public static toNoCommaNumber ( value: string ): number {
        return Number( value.replace( /,/g, '' ) );
    }

    public static numberComma ( value: number, isfloat = false ) {
        let decimalPoint = gameInformation.currencyDecimalPoint;
        return Number( value.toFixed( decimalPoint ) ).toLocaleString( "en", { minimumFractionDigits: decimalPoint } );
    }

    public static numberCommaFloat ( value: number,decimalPoint:number = 1 ) {
        let result = Number(value.toFixed(decimalPoint));
        if (result % 1 === 0) {//沒有小於1的值
            return result.toLocaleString("en");
        } else {
            return result.toLocaleString("en", { minimumFractionDigits: decimalPoint });
        }
    }

    /**
     * Convert window.location.href params data to json
     * @returns Null or Json
     */
    public static parseURLToJson (): any {
        let fullURL: string = window.location.href;
        if ( fullURL == null ) return null;

        let splitURL = fullURL.split( '?' );
        if ( splitURL.length != 2 ) return null;

        let queryString = splitURL[ 1 ];
        let params = new URLSearchParams( queryString );
        let paramsObj: { [ key: string ]: string } = {};

        for ( const [ key, value ] of params.entries() ) {
            paramsObj[ key ] = value;
        }

        return paramsObj;
    }

    public static delay ( ms: number ): Promise<void> {
        if ( ms === 0 ) return;
        return new Promise( ( resolve ) => { setTimeout( resolve, ms ); } );
    }


    public static waittingData = {};


    public static s4 () {
        return Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
    }

    public static uuid () {
        let s4 = Utils.s4;
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    public static async delayHandler ( name: string, time: number, event: EventHandler = null ): Promise<any> {
        let code = Utils.uuid();
        this.waittingData[ name ] = code;
        await this.delay( time );
        if ( this.waittingData[ name ] != code ) return false;
        if ( event ) {
            let target = event.target;
            let comp = target.getComponent( event.component );
            let method = event.handler;
            return comp[ method ]( event.customEventData );
        }
        return true;
    }

    public static removeDelay ( name: string ) { this.waittingData[ name ] = null; }

    public static isDevelopment (): boolean {
        if ( Utils.getSite() === 'Develop' ) return true;
        if ( PREVIEW === true ) return true;

        return false;
    }

    public static getSite () {
        let domain = window.location.hostname;
        if ( Config == null || Object.keys( Config ).length === 0 ) return Utils.getConfig();
        if ( Config[ 'Sites' ] == null ) return Utils.getConfig();

        let keys = Object.keys( Config[ 'Sites' ] );
        for ( let i in keys ) {
            let key = keys[ i ];
            let sites: string[] = Config[ 'Sites' ][ key ];

            if ( sites == null ) continue;
            if ( sites.length === 0 ) continue;
            if ( sites.indexOf( domain ) < 0 ) continue;

            return key;
        }

        return null;
    }

    public static getConfig ( callback: EventHandler = null ) {
        if ( Config != null ) return callback?.emit( [ Config ] );
        resources.load( 'data/config', JsonAsset, ( err, config ) => {
            if ( err != null ) return;
            GameConfig.setConfig( config.json );
            this.setVersion( Config[ 'Version' ] );
            this.loadCurrency();
            // console.log(Config);
            callback?.emit( [ config.json ] );
        } );
    }

    public static setVersion ( ver: string ) {
        if ( gversion != undefined ) return;

        var gscript = document.createElement( 'script' );
        gscript.innerHTML = `var gversion = "${ ver }"\n`;
        gversion = ver;

        if ( Utils.isDevelopment() === false ) gscript.innerHTML += "console.log = ()=>{};";
        document.body.appendChild( gscript );
    }

    public static getVersion () { return gversion; }

    public static loadCurrency(callback: EventHandler = null) {
        if ( Config.currency != null ) return callback?.emit([Config.currency]);
        resources.load('data/currency', JsonAsset, (err, currency) => {
            if (err != null) return console.error(err);
            Config.currency = currency.json;
            callback?.emit([currency.json]);
        });
    }

    public static stringFormat ( str: string, ...args: any[] ): string {
        return str.replace( /{(\d+)}/g, function ( match, number ) {
            return typeof args[ number ] != 'undefined'
                ? args[ number ]
                : match;
        } );
    }

    public static createCurveRange () {
        let curve = new CurveRange();
        curve.mode = CurveRange.Mode.Curve;
        curve.spline.postExtrapolation = 1;
        curve.spline.preExtrapolation = 1;
        return curve;
    }

    public static async delayEvent ( event: EventTarget = null, eventType: string ): Promise<any> {
        if ( event == null ) return;
        return await new Promise( ( resolve ) => { event.once( eventType, resolve ); } );
    }

    public static async awaitEventHandler ( eventHandler: EventHandler, ...args ): Promise<any> {
        if ( eventHandler == null ) return;
        if ( eventHandler.target == null ) return;
        if ( eventHandler.component == null ) return;

        let obj = eventHandler.target;
        let comp = obj.getComponent( eventHandler.component );
        let event = eventHandler.handler;

        if ( comp == null ) return;
        if ( event == null ) return;
        return await comp[ event ]( ...args );
    }

    public static getAnimationDuration ( target: sp.Skeleton, animationName: string ): number {
        if ( target == null ) return 0;
        if ( animationName == null ) return 0;

        let animationState: sp.spine.AnimationState = target.getState()!;
        const animation: sp.spine.Animation = animationState?.data.skeletonData.findAnimation( animationName );
        return animation?.duration ?? 0;//空值合并，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作，否则返回左侧。
    }
}

export var gversion = null;

export enum TWEEN_EASING_TYPE { '自定義曲線', "linear", "smooth", "fade", "constant", "quadIn", "quadOut", "quadInOut", "quadOutIn", "cubicIn", "cubicOut", "cubicInOut", "cubicOutIn", "quartIn", "quartOut", "quartInOut", "quartOutIn", "quintIn", "quintOut", "quintInOut", "quintOutIn", "sineIn", "sineOut", "sineInOut", "sineOutIn", "expoIn", "expoOut", "expoInOut", "expoOutIn", "circIn", "circOut", "circInOut", "circOutIn", "elasticIn", "elasticOut", "elasticInOut", "elasticOutIn", "backIn", "backOut", "backInOut", "backOutIn", "bounceIn", "bounceOut", "bounceInOut", "bounceOutIn" }

@ccclass( 'CurveProperty' )
export class CurveRangeProperty {

    @property( { type: Enum( TWEEN_EASING_TYPE ), displayName: '動態曲線設定', tooltip: '動態曲線設定' } )
    public curveType: TWEEN_EASING_TYPE = TWEEN_EASING_TYPE[ 'quadOut' ];

    @property( { type: CurveRange, displayName: '曲線設定', tooltip: '曲線設定', visible: function ( this: CurveRangeProperty ) { return this.curveType === TWEEN_EASING_TYPE[ '自定義曲線' ]; } } )
    // public curveRange: CurveRange = Utils.createCurveRange();
    public curveRange: CurveRange = null;
    /**
     * 取得 easing 設定
     * @param property 
     * @returns 
     */
    public static getEasing ( property: CurveRangeProperty ): string | ( ( k: number ) => number ) {

        if ( property.curveType !== TWEEN_EASING_TYPE[ '自定義曲線' ] ) return TWEEN_EASING_TYPE[ property.curveType.valueOf() ].toString();

        return ( k: number ) => {
            let value = property.curveRange.evaluate( k, 1 );
            return value;
        };
    }
}
