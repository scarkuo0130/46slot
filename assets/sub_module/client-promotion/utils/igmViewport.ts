import { _decorator, AsyncDelegate, ResolutionPolicy, view, screen } from 'cc';
import { PREVIEW } from 'cc/env';
const { ccclass, property } = _decorator;

export enum igmOrientation {
    PORTRAIT,
    LADNSCAPE
}

export interface igmIOrientable {
    onOrientationChange ( orientation: igmOrientation ): void;
    /**
     * Rearrange all components position here for portrait layout
     */
    portraitLayout (): void;
    /**
     * Rearrange all components position here for landscape layout
     */
    landscapeLayout (): void;
}

@ccclass( 'igmViewport' )
export class igmViewport {
    //#region Singleton
    protected static _instance: igmViewport;
    public static get instance () {
        if ( !igmViewport._instance ) {
            igmViewport._instance = new igmViewport();
        }
        return igmViewport._instance;
    }
    //#endregion

    /**
     * On orientation change listener
     */
    public onOrientationChangeSignal: AsyncDelegate<( orientation: igmOrientation ) => void> = new AsyncDelegate();

    protected previousOrientation: igmOrientation = igmOrientation.PORTRAIT;
    protected orientation: igmOrientation = igmOrientation.PORTRAIT;

    protected designResolutionWidth: number = 720;
    protected designResolutionHeight: number = 1280;

    protected constructor () {
        this.checkOrientation();

        if ( PREVIEW ) {
            view.setResizeCallback( this.resizeHandler.bind( this ) );
        } else {
            window.addEventListener( 'resize', this.resizeHandler.bind( this ) );
        }
    }

    public getCurrentOrientation (): igmOrientation {
        return this.orientation;
    }

    protected resizeHandler (): void {
        window.setTimeout( ( event ) => {
            this.checkOrientation();

            // * Delay 50 ms to dispatch
            //window.setTimeout( ( event ) => {
            if ( this.orientation !== this.previousOrientation ) {
                this.onOrientationChangeSignal.dispatch( this.orientation );
            }
            //}, 0 );
        }, 50 );
    }

    protected checkOrientation (): void {
        // * Keep the previous orientation
        this.previousOrientation = this.orientation;

        const width: number = ( PREVIEW ) ? screen.windowSize.width : window.innerWidth;
        const height: number = ( PREVIEW ) ? screen.windowSize.height : window.innerHeight;

        if ( width > height ) {
            this.orientation = igmOrientation.LADNSCAPE;
            view.setDesignResolutionSize( this.designResolutionHeight, this.designResolutionWidth, ResolutionPolicy.SHOW_ALL );
        } else {
            this.orientation = igmOrientation.PORTRAIT;
            view.setDesignResolutionSize( this.designResolutionWidth, this.designResolutionHeight, ResolutionPolicy.SHOW_ALL );
        }
    }
}
