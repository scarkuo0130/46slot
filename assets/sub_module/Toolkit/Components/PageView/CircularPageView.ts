import { _decorator, Component, PageView } from 'cc';

const { ccclass, requireComponent } = _decorator;

@ccclass('CircularPageView')
@requireComponent(PageView)
export default class CircularPageView extends Component {
    private _pageView: PageView = null;

    protected onLoad() {
        this._pageView = this.getComponent(PageView);

        this._pageView.node.on(PageView.EventType.PAGE_TURNING, () => {
            if (this._pageView.curPageIdx === 0) {
                // use scheduleOnce to wait for page position update finished
                this.scheduleOnce(() => {
                    // set turning time 0.01 to trigger page turning event
                    this._pageView.scrollToPage(this._pageView.content.children.length - 2, 0.01);
                });
            } else if (this._pageView.curPageIdx === this._pageView.content.children.length - 1) {
                // use scheduleOnce to wait for page position update finished
                this.scheduleOnce(() => {
                    // set turning time 0.01 to trigger page turning event
                    this._pageView.scrollToPage(1, 0.01);
                });
            }
        });
    }

    protected start() {
        // set turning time 0.01 to trigger page turning event
        this._pageView.scrollToPage(1, 0.01);
    }
}
