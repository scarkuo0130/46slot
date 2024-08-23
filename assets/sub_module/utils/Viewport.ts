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

export enum ORIENTATION_EVENT {
    ON_PRE_ORIENTATION_CHANGE   = 'onPreOrientationChange',
    ON_ORIENTATION_CHANGE       = 'onOrientationChange',
    ON_ORIENTATION_CHANGE_END   = 'onOrientationChangeEnd',
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

        screen.on('fullscreen-change', this.fullscreenChangeHandler.bind( this ) );
        this.eventEmitters = {  
            [ORIENTATION_EVENT.ON_PRE_ORIENTATION_CHANGE]:  [],
            [ORIENTATION_EVENT.ON_ORIENTATION_CHANGE]:      [],
            [ORIENTATION_EVENT.ON_ORIENTATION_CHANGE_END]:  [],
        };
    }

    public static on ( event: ORIENTATION_EVENT, callback: Function ) {
        Viewport.instance.eventEmitters[event].push( callback );
        return callback;
    }

    public fullscreenChangeHandler ( width: number, height: number ) {}

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

    public eventEmitters: any = {  };

    private isResizeHandlerLocked: boolean = false;
    protected async resizeHandler ( lockOrientation = null ) {
        if ( EDITOR === true ) return;
        if ( this.isResizeHandlerLocked === true ) return;
        this.isResizeHandlerLocked = true;

        await Promise.all( this.eventEmitters[ORIENTATION_EVENT.ON_PRE_ORIENTATION_CHANGE].map( async e => await e(this.orientation) ) );
        await new Promise( ( resolve ) => { setTimeout( resolve, 50 ); } ); // * Delay 50 ms to dispatch
        this.checkOrientation( lockOrientation );
            
        if ( this.orientation !== this.previousOrientation ) {
            this.onOrientationChangeSignal.dispatch( this.orientation );
            this.onOrientationChangeEventHandler.forEach( e => { e.emit( [ this.orientation, e.customEventData ] ); } );
            await Promise.all( this.eventEmitters[ORIENTATION_EVENT.ON_ORIENTATION_CHANGE].map( async e => await e(this.orientation) ) );
            await Promise.all( this.eventEmitters[ORIENTATION_EVENT.ON_ORIENTATION_CHANGE_END].map( async e => await e(this.orientation) ) );

            const event = this.orientation === Orientation.LANDSCAPE ? 'Landscape' : 'Portrait';
            Utils.GoogleTag('Orientation'+event, {'event_category':'orientation', 'event_label':'orientation', 'value': this.orientation });
        }

        this.isResizeHandlerLocked = false;
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
