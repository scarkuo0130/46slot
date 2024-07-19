import { _decorator, Component, EventHandler, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('onStartEvent')
export class onStartEvent extends Component {
    @property({ type: EventHandler, tooltip: '啟動時執行的事件' })
    public onStartEvent: EventHandler = new EventHandler();

    start() {
        if (this.onStartEvent) this.onStartEvent.emit([this.node]);
        
    }
}

