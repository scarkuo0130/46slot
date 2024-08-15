import { _decorator, PageViewIndicator, Color, UIRenderer } from 'cc';

const { ccclass } = _decorator;
const _color = new Color();

@ccclass('CircularPageViewIndicator')
export default class CircularPageViewIndicator extends PageViewIndicator {
    public _changedState() {
        const indicators = this._indicators;
        if (indicators.length === 0 || !this._pageView) {
            return;
        }
        let idx = this._pageView.curPageIdx;
        if (idx === 0) {
            idx = indicators.length - 1;
        } else if (idx === this._pageView.getPages().length - 1) {
            idx = 0;
        } else {
            idx--;
        }
        if (idx >= indicators.length) {
            return;
        }
        for (let i = 0; i < indicators.length; ++i) {
            const node = indicators[i];
            if (!node._uiProps.uiComp) {
                continue;
            }

            const uiComp = node._uiProps.uiComp as UIRenderer;
            _color.set(uiComp.color);
            _color.a = 255 / 2;
            uiComp.color = _color;
        }

        if (indicators[idx]._uiProps.uiComp) {
            const comp = indicators[idx]._uiProps.uiComp as UIRenderer;
            _color.set(comp.color);
            _color.a = 255;
            comp.color = _color;
        }
    }

    public _refresh() {
        if (!this._pageView) {
            return;
        }
        const indicators = this._indicators;
        const pages = this._pageView.getPages();
        const actualPageCount = pages.length - 2;
        if (actualPageCount === indicators.length) {
            return;
        }
        let i = 0;
        if (actualPageCount > indicators.length) {
            for (i = 0; i < actualPageCount; ++i) {
                if (!indicators[i]) {
                    indicators[i] = this._createIndicator();
                }
            }
        } else {
            const count = indicators.length - actualPageCount;
            for (i = count; i > 0; --i) {
                const node = indicators[i - 1];
                this.node.removeChild(node);
                indicators.splice(i - 1, 1);
            }
        }
        if (this._layout && this._layout.enabledInHierarchy) {
            this._layout.updateLayout();
        }
        this._changedState();
    }
}
