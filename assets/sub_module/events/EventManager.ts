/**
 * An Event callback function type
 */
export type EventCallback = ( data?: any ) => void;

/**
 * Event Data class
 */
export class EventData {
    public target: any;
    public event: string;
    public callback: EventCallback;

    constructor ( target: any, event: string, callback: EventCallback ) {
        this.target = target;
        this.event = event;
        this.callback = callback;
    }
}


import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

/**
 * An Event Manager for global use
 */
@ccclass( 'EventManager' )
export class EventManager {
    //#region Singleton
    protected static _instance: EventManager;
    public static get instance () {
        if ( !EventManager._instance ) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    //#endregion

    protected eventMap: Map<string, Array<EventData>> = new Map<string, Array<EventData>>();

    public addListener ( target: any, event: string, callback: EventCallback ): void {
        const eventData: EventData = new EventData( target, event, callback );
        if ( this.eventMap.has( event ) ) {
            const eventList: Array<EventData> = this.eventMap.get( event );
            eventList.push( eventData );
        } else {
            const eventList: Array<EventData> = new Array<EventData>();
            eventList.push( eventData );
            this.eventMap.set( event, eventList );
        }
    }

    public addListenerOnce ( target: any, event: string, callback: EventCallback ): void {
        let onceCallback: EventCallback = ( data?: any ) => {
            this.removeListener( target, event, onceCallback );
            onceCallback = undefined;
            callback.call( target, data );
        };

        this.addListener( target, event, onceCallback );
    }

    public removeListener ( target: any, event: string, callback: EventCallback ): void {
        if ( this.eventMap.has( event ) ) {
            let eventList: Array<EventData> = this.eventMap.get( event );
            eventList.forEach( ( eventItem: EventData, index: number ) => {
                if ( eventItem.target === target && eventItem.callback === callback ) {
                    eventList.splice( index, 1 );
                    eventItem.callback = undefined;
                    if ( eventList.length === 0 ) {
                        this.eventMap.delete( event );
                    }
                }
                return;
            } );
        }
    }

    public dispatchEvent ( event: string, data?: any ): void {
        if ( this.eventMap.has( event ) ) {
            let eventList: Array<EventData> = this.eventMap.get( event );
            eventList.forEach( ( eventItem: EventData ) => {
                if ( eventItem.callback ) {
                    eventItem.callback.call( eventItem.target, data );
                }
            } );
        }
    }
}