import { _decorator, AsyncDelegate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'WebsocketUtils' )
export class WebsocketUtils {
    protected websocket: WebSocket = undefined;
    public onMessageDelegate: AsyncDelegate<( data: any ) => void>;
    public onOpenDelegate: AsyncDelegate<() => void>;
    public onErrorDelegate: AsyncDelegate<() => void>;
    public onCloseDelegate: AsyncDelegate<() => void>;

    protected url: string;

    constructor ( url: string ) {
        this.url = url;

        this.onMessageDelegate = new AsyncDelegate();
        this.onOpenDelegate = new AsyncDelegate();
        this.onErrorDelegate = new AsyncDelegate();
        this.onCloseDelegate = new AsyncDelegate();
    }

    public connect (): void {
        if ( this.websocket ) {
            if ( this.websocket.readyState === WebSocket.CONNECTING ) {
                console.log( '[WebsocketUtils] is connecting...' );
                return;
            }
        }

        this.websocket = new WebSocket( this.url );
        // TODO: make sure the binary type is 'arraybuffer' or 'blob'

        this.websocket.onopen = this.onOpen.bind( this );
        this.websocket.onmessage = this.onMessage.bind( this );
        this.websocket.onclose = this.onClose.bind( this );
        this.websocket.onerror = this.onError.bind( this );
    }

    protected onOpen ( event: Event ): any {
        console.log( '[WebsocketUtils] onOpen =>', event );
        this.onOpenDelegate.dispatch();
    }

    protected onMessage ( event: MessageEvent<any> ): any {
        console.log( '[WebsocketUtils] onMessage =>', event );
        this.onMessageDelegate.dispatch( event.data );
    }

    protected onClose ( event: CloseEvent ): any {
        console.log( '[WebsocketUtils] onClose =>', event );
        this.onCloseDelegate.dispatch();
    }

    protected onError ( event: Event ): any {
        console.log( '[WebsocketUtils] onError =>', event );
        this.onErrorDelegate.dispatch();
    }

    // TODO: Need to define the sending data format
    public send ( data: any ): number {
        if ( this.websocket && this.websocket.readyState === WebSocket.OPEN ) {
            this.websocket.send( data );
            return 1;
        }
        return -1;
    }

    public close ( code?: number, reason?: string ): void {
        this.websocket.close( code, reason );
    }
}

