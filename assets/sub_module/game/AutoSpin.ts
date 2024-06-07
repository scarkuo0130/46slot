import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AutoSpin')
export class AutoSpin extends Component {

    public static Instance: AutoSpin = null;
    protected onLoad(): void {
        AutoSpin.Instance = this;
    }
}

