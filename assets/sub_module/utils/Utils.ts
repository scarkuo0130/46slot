import { EventHandler, bezier, JsonAsset, resources, CurveRange, find, _decorator, Enum, EventTarget, sp, game, Node, tween, Vec3, Sprite, Color, Label, TweenEasing } from "cc";
import { PREVIEW, EDITOR } from "cc/env";
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
            if ( EDITOR === true ) return;
            if ( Utils.isDevelopment() === true ) return;
            if ( value === false ) return;
            target[ propertyKey ] = () => { };
            console.log = () => { };
        };
    }
}

export enum DATA_TYPE {
    NODE = 0, // object node
    COMPONENT = 1, // object component
    TYPE = 2, // object component type
    NODE_PATH = 3, // node path for init object
    CLICK_EVENT = 4, // click event
    SCENE_PATH = 5, // scene path
}

export class Utils {
    public static initPropertyData<T>(component: T) {
        return {
            [DATA_TYPE.NODE]        : Node,
            [DATA_TYPE.COMPONENT]   : component,
            [DATA_TYPE.TYPE]        : null,
            [DATA_TYPE.NODE_PATH]   : "",
            [DATA_TYPE.CLICK_EVENT] : Function,

            get node()      { return this[DATA_TYPE.NODE]; },
            get component() { return this[DATA_TYPE.COMPONENT]; },
            get type()      { return this[DATA_TYPE.TYPE]; },
            get clickEvent(){ return this[DATA_TYPE.CLICK_EVENT]; },
        };
    }

    public static processProperty(bindComponent: any, key: string, property: any) {
        let haveInitEvent = null;

        for(let j=0;j<Object.keys(property).length;j++) {
            const subKey = Object.keys(property)[j];
            const subProperty = property[subKey];

            if ( subKey === 'INIT_EVENT' ) {
                let boundSubProperty = subProperty.bind(bindComponent);
                haveInitEvent = boundSubProperty;
                continue;
            }
            let node: any, path : string;

            if ( subProperty[DATA_TYPE.SCENE_PATH] != null ) {
                path = subProperty[DATA_TYPE.SCENE_PATH];
                if ( path == null || typeof(path) !== 'string' ) continue;
                node = find(path);
                if ( node == null ) {
                    console.error('Node not found: ' + subProperty[DATA_TYPE.SCENE_PATH]);
                    continue;
                }
            } else {
                path = subProperty[DATA_TYPE.NODE_PATH];
                if ( path == null || typeof(path) !== 'string' ) continue;

                node = bindComponent.node.getChildByPath(path);
                if ( node == null ) {
                    console.error('Node not found: ' + subProperty[DATA_TYPE.NODE_PATH]);
                    continue;
                }
            }

            const t = subProperty[DATA_TYPE.TYPE];
            const component = ( t == Node ) ? node : node.getComponent(t);
            
            if ( component == null ) {
                // console.error('Component not found: ' + subProperty[DATE_TYPE.TYPE], path);
                continue;
            }

            let propertiesData = Utils.initPropertyData(component);

            if ( subProperty[DATA_TYPE.CLICK_EVENT] != null ) {
                node.on(Node.EventType.TOUCH_END, subProperty[DATA_TYPE.CLICK_EVENT], bindComponent);
                Utils.AddHandHoverEvent(node);
            }

            propertiesData[DATA_TYPE.NODE]        = node;
            propertiesData[DATA_TYPE.COMPONENT]   = component;
            propertiesData[DATA_TYPE.TYPE]        = t;
            propertiesData[DATA_TYPE.NODE_PATH]   = path;
            propertiesData[DATA_TYPE.CLICK_EVENT] = subProperty[DATA_TYPE.CLICK_EVENT];

            const otherData = subProperty;
            delete otherData[DATA_TYPE.NODE];
            delete otherData[DATA_TYPE.COMPONENT];
            delete otherData[DATA_TYPE.TYPE];
            delete otherData[DATA_TYPE.NODE_PATH];
            delete otherData[DATA_TYPE.CLICK_EVENT];
            if ( Object.keys(otherData).length > 0 ) propertiesData = Utils.mergeJsonData(propertiesData, otherData);

            if ( !property[key] || !property[key][subKey] ) property[subKey] = propertiesData;
            else property[subKey] = Utils.mergeJsonData(property[key][subKey], propertiesData);
        }

        return { property, haveInitEvent };
    }
    /**
     * 預載資料初始化
     * @param initData 
     * @param bindComponent 
     * @returns 
     */
    public static initData( initData:any, bindComponent: any ) {
        if ( initData == null ) return;
        if ( bindComponent == null ) return;
        if ( bindComponent.node == null ) return;

        let properties = bindComponent['properties'];
        if ( properties == null ) properties = {};

        for(let i=0;i<Object.keys(initData).length;i++) {
            const key = Object.keys(initData)[i];
            const property = initData[key];

            const { property: processedProperty, haveInitEvent } = Utils.processProperty(bindComponent, key, property);

            properties[key] = processedProperty;

            if ( haveInitEvent != null ) haveInitEvent();
        }
    }

    public static twoBezier(t:number, p1:Vec3, cp1:Vec3, cp2:Vec3, p2:Vec3) {
        //const x = (1-t)*(1-t)*p1.x + 2*(1-t)*t*cp.x + t*t*p2.x;
        //const y = (1-t)*(1-t)*p1.y + 2*(1-t)*t*cp.y + t*t*p2.y;
        //return new Vec3(x, y, 0);

        const x = bezier(p1.x, cp1.x, cp2.x, p2.x, t);
        const y = bezier(p1.y, cp1.y, cp2.y, p2.y, t);
        return new Vec3(x, y, 0);
    }

    /**
     * 
     * @param target 
     * @param toPos 
     * @param duration 
     * @param middlePos 
     */
    public static async tweenBezierCurve(target: Node, toPos: Vec3, duration: number, onFinish: Function = null, isWorldPos: boolean = false, middlePos: Vec3 = null, middlePos2:Vec3 = null) {
        const fromPos = isWorldPos ? target.worldPosition : target.position.clone();
        if (middlePos == null) {
            // 找出中間點 附上一點點的隨機值
            middlePos = fromPos.clone();
            middlePos.add(toPos).multiplyScalar(0.5);
            const xDistance = Math.abs(fromPos.x - toPos.x) * 0.3;
            const yDistance = Math.abs(fromPos.y - toPos.y) * 0.3;
            middlePos.x += Utils.Random(-xDistance, xDistance);
            middlePos.y += Utils.Random(-yDistance, yDistance);

            console.log(fromPos, middlePos, toPos);
        }

        if ( middlePos2 == null ) {
            middlePos2 = middlePos.clone();
            middlePos2.add(toPos).multiplyScalar(0.5);
        }
        let eventTarget = new EventTarget();
        let tValue = { t: 0 }; // 用於跟踪 t 的值
        let onUpdate = (obj) => {
            const movePos = Utils.twoBezier(obj.t, fromPos, middlePos,middlePos2, toPos);
            if (isWorldPos) target.worldPosition = movePos;
            else target.position = movePos;
        };
        let onComplete = () => { eventTarget.emit('done'); };
    
        tween(tValue).to(duration, { t: 1 }, { onUpdate: () => onUpdate(tValue), onComplete: onComplete }).start();
        await Utils.delayEvent(eventTarget);
        eventTarget.removeAll('done');
        eventTarget = null;
        if (onFinish != null) onFinish();
    }

    public static async tweenBezierCurve2(target:Node, toPos:Vec3, duration:number, onFinish:Function, isWorldPos:boolean, easing:any = 'smooth') {
        let eventTarget = new EventTarget();
        let onComplete = () => { eventTarget.emit('done'); };
        if ( isWorldPos ) {
            tween(target).to(duration, { worldPosition: toPos }, { easing: easing, onComplete: onComplete }).start();
        } else {
            tween(target).to(duration, { position: toPos }, { easing: easing, onComplete: onComplete }).start();
        }
        await Utils.delayEvent(eventTarget);
        eventTarget.removeAll('done');
        eventTarget = null;
        if (onFinish != null) onFinish();
    }

    /**
     * 合併兩個 JSON 物件
     */
    public static mergeJsonData( target: any, source: any ) {
        if ( target == null ) target = {};
        if ( source == null ) return target;

        let keys = Object.keys(source);
        for ( let i in keys ) {
            let key = keys[ i ];
            target[ key ] = source[ key ];
        }

        return target;
    }

    public static AddHandHoverEvent ( target: Node ) {
        target.on( Node.EventType.MOUSE_ENTER, () => { game.canvas.style.cursor = 'pointer'; } );
        target.on( Node.EventType.MOUSE_LEAVE, () => { game.canvas.style.cursor = 'default'; } );
    }

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

    public static numberCommaM( value:number ) {
        if ( value < 1000000 ) return Utils.numberComma( value );
        let decimalPoint = gameInformation.currencyDecimalPoint;
        let result = Number( ( value / 1000000 ).toFixed( decimalPoint ) );
        return result.toLocaleString( "en", { minimumFractionDigits: decimalPoint } ) + 'M';
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
        if ( EDITOR === true ) return 'Develop';
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
            if ( err != null ) return console.error( err );
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

    public static async delayEvent ( event: EventTarget = null, eventType: string = 'done' ): Promise<any> {
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
        return animation?.duration ?? 0;
    }

    public static readonly activeUIScale = [ new Vec3( 0.5, 0.5, 1 ), new Vec3( 1, 1, 1 )];
    public static readonly activeUIAlpha = [ new Color( 255, 255, 255, 0 ), new Color( 255, 255, 255, 255 )];
    public static activeUIEventTarget: EventTarget = null;
    public static async commonActiveUITween( ui:Node, active:boolean) {
        if ( ui == null ) return;
        if (this.activeUIEventTarget?.['running'] === true) return;

        let fromScale = active ? this.activeUIScale[ 0 ] : this.activeUIScale[ 1 ];
        let toScale   = active ? this.activeUIScale[ 1 ] : this.activeUIScale[ 0 ];
        this.activeUIEventTarget = this.activeUIEventTarget ?? new EventTarget();
        this.activeUIEventTarget.removeAll('done');
        this.activeUIEventTarget['running'] = true;
        ui.setScale( fromScale );
        ui.active = true;
        tween( ui ).to(0.3, { scale: toScale }, { 
            easing: 'backOut',
            onComplete:(x)=> Utils.activeUIEventTarget.emit('done')
        }).start();

        let sprite = ui.getComponent(Sprite);
        if ( sprite != null ) {
            let fromColor = active ? this.activeUIAlpha[ 0 ] : this.activeUIAlpha[ 1 ];
            let toColor   = active ? this.activeUIAlpha[ 1 ] : this.activeUIAlpha[ 0 ];
            sprite.color = fromColor;
            tween( sprite ).to(0.3, { color: toColor }, { easing: 'smooth' }).start();
        }

        await this.delayEvent( this.activeUIEventTarget );
        this.activeUIEventTarget['running'] = false;
        ui.active = active;
    }

    /** 等待播放完畢 Spine 動畫  */
    public static async playSpine(spine:sp.Skeleton, animationName:string, loop:boolean = false) {
        if ( spine == null ) return;
        if ( animationName == null ) return;
        
        let duration = this.getAnimationDuration(spine, animationName) * 1000 ;
        let track : sp.spine.TrackEntry = spine.setAnimation(0, animationName, loop);
        
        spine['track'] = track;
        spine['isPlaying'] = true;
        spine.setCompleteListener((trackEntry) => { spine['isPlaying'] = false; });

        await Utils.delay(duration);
    }

    /**
     * 共用 tween 數字變化動畫
     * @param label             { Label  }           顯示的 Label
     * @param from              { number }           起始數字
     * @param to                { number }           結束數字
     * @param duration          { float }             動畫時間
     * @param numberStringFunc  { Function }         數字轉換字串函式 (value:number)=>string
     * @param eventTarget       { EventTarget }      指定等待結束事件
     * @returns 
     */
    public static async commonTweenNumber(label:Label, from:number=0, to:number, duration:number, numberStringFunc:Function=null, eventTarget:EventTarget=null) : Promise<any>{
        if ( label == null ) return;
        
        let data = { value: from };

        if ( numberStringFunc == null ) numberStringFunc = Utils.numberComma;
        label.string = numberStringFunc(from);


        const t = tween(data).to(duration, { value: to }, { easing: 'smooth',
            onUpdate:   () => { label.string = numberStringFunc(data.value); },
            onComplete: () => { eventTarget?.emit('done'); }
         }).start();

        if ( eventTarget == null ) return;
        return await Utils.delayEvent(eventTarget);
    }

    public static async commonFadeIn( ui:Node, fadeout:boolean=false, color: Color[]=null, colorComponent=null, duration:number=0.3, eventTarget:EventTarget=null) {
        if ( ui == null ) return;
        if ( eventTarget && eventTarget['running'] === true) return;
        if (this.activeUIEventTarget?.['running'] === true) return;
        let sprite = colorComponent;
        if ( sprite == null ) sprite = ui.getComponent(Sprite);

        if ( sprite == null ) return;
        const refColor = color ?? this.activeUIAlpha;
        let fromColor = fadeout ? refColor[1] : refColor[0];
        let toColor   = fadeout ? refColor[0] : refColor[1];

        if ( eventTarget == null ) eventTarget = new EventTarget();
        eventTarget.removeAll('done');
        eventTarget['running'] = true;
        
        sprite.color = fromColor;
        let alpha = { value: fromColor.a };
        tween(alpha).to(duration, { value: toColor.a }, { easing: 'smooth',
            onUpdate:   () => { sprite.color = new Color(toColor.r, toColor.g, toColor.b, alpha.value); },
            onComplete: () => { eventTarget.emit('done'); }
         }).start();
        //tween( sprite ).to(0.3, { color: toColor }, { easing: 'smooth' }).start();
        await this.delayEvent( eventTarget );
        eventTarget['running'] = false;
        ui.active = !fadeout;
        eventTarget = null;
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
