import { Node, director, _decorator, AsyncDelegate, ResolutionPolicy, view, screen, EventHandler } from 'cc';
import { EDITOR, PREVIEW } from 'cc/env';
import { Utils } from './Utils';
const { ccclass, property } = _decorator;

export enum Orientation {
    PORTRAIT,
    LANDSCAPE,
}

export interface IOrientable {
    onOrientationChange ( orientation: Orientation ): void;
    /**
     * Rearrange all components position here for portrait layout
     */
    portraitLayout (): void;
    /**
     * Rearrange all components position here for landscape layout
     */
    landscapeLayout (): void;
}

@ccclass( 'Viewport' )
export class Viewport {

    public static DevelopLockOrientation: Orientation;

    //#region [[rgba(0,0,0,0)]] Singleton
    protected static _instance: Viewport;
    public static get instance () {
        if ( !Viewport._instance ) {
            Viewport._instance = new Viewport();
        }

        return Viewport._instance;
    }
    //#endregion

    /**
     * On orientation change listener
     */
    public onOrientationChangeSignal: AsyncDelegate<( orientation: Orientation ) => void> = new AsyncDelegate();

    public onOrientationChangeEventHandler: EventHandler[] = [];

    protected previousOrientation: Orientation = Orientation.PORTRAIT;
    protected orientation: Orientation = Orientation.PORTRAIT;

    protected designResolutionWidth: number = 720;
    protected designResolutionHeight: number = 1280;

    protected canvasNode: Node;

    protected constructor () {
        view.resizeWithBrowserSize( true );
        this.canvasNode = director.getScene().getChildByName( 'Canvas' );

        this.onOrientationChangeEventHandler = [];
        this.checkOrientation();

        if ( PREVIEW ) {
            view.setResizeCallback( this.resizeHandler.bind( this ) );
        } else {
            if ( EDITOR ) return;
            window.addEventListener( 'resize', this.resizeHandler.bind( this ) );
        }
    }

    public static get Orientation (): Orientation { return Viewport.instance.getCurrentOrientation();}

    public getCurrentOrientation (): Orientation { return this.orientation; }

    public addOrientationChangeEventHandler ( event: EventHandler ) {
        if ( event == null ) return;
        this.onOrientationChangeEventHandler.push( event );
    }

    public removeOrientationChangeEventHandler ( event: EventHandler ) {
        if ( event == null ) return;
        let idx = this.onOrientationChangeEventHandler.indexOf( event );
        if ( idx == -1 ) return;

        this.onOrientationChangeEventHandler.splice( idx, 1 );
    }

    protected resizeHandler ( lockOrientation = null ): void {
        if ( EDITOR === true ) return;
        console.log( 'resizeHandler');
        window.setTimeout( ( event ) => {
            console.log( 'resizeHandler', [ this.orientation, this.previousOrientation ] );
            this.checkOrientation( lockOrientation );
            // * Delay 50 ms to dispatch
            if ( this.orientation !== this.previousOrientation ) {
                const event = this.orientation === Orientation.LANDSCAPE ? 'Landscape' : 'Portrait';
                Utils.GoogleTag('Orientation'+event, {'event_category':'orientation', 'event_label':'orientation', 'value': this.orientation });
                this.onOrientationChangeSignal.dispatch( this.orientation );
                if ( this.onOrientationChangeEventHandler.length > 0 ) {
                    this.onOrientationChangeEventHandler.forEach( e => { e.emit( [ this.orientation, e.customEventData ] ); } );
                }
                console.log( 'Orientation changed', this.onOrientationChangeEventHandler );
            }
        }, 50 );
    }

    public static lockResizeHandler ( lockOrientation = null ) { Viewport.instance.resizeHandler( lockOrientation ); }

    protected checkOrientation ( lockOrientation = null ): void {
        // * Keep the previous orientation
        this.previousOrientation = this.orientation;

        const width: number = ( PREVIEW ) ? screen.windowSize.width : window.innerWidth;
        const height: number = ( PREVIEW ) ? screen.windowSize.height : window.innerHeight;

        if ( width > height ) {
            this.orientation = Orientation.LANDSCAPE;
            view.setDesignResolutionSize( this.designResolutionHeight, this.designResolutionWidth, ResolutionPolicy.SHOW_ALL );
        } else {
            this.orientation = Orientation.PORTRAIT;
            view.setDesignResolutionSize( this.designResolutionWidth, this.designResolutionHeight, ResolutionPolicy.SHOW_ALL );
        }
        this.resizeScale( width, height, this.orientation );
    }

    protected resizeScale ( width: number, height: number, orientation: Orientation ) {
        let ratio;
        if ( orientation === Orientation.LANDSCAPE ) {
            ratio = height / ( width / 16 * 9 );

        } else {
            ratio = width / ( height / 16 * 9 );
        }

        if ( ratio > 1 ) ratio = 1;
        setTimeout( () => {
            let canvas: Node = director.getScene().getChildByName( 'Canvas' );
            canvas.setScale( 1, 1, 1 );
        }, 100 );
    }
}
