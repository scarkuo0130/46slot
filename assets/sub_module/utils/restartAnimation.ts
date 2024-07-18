import { _decorator, Component, Node, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('restartAnimation')
export class restartAnimation extends Component {

    private animation: Animation = null;

    start() { this.animation = this.getComponent(Animation); }

    protected onEnable(): void { 
        if ( this.animation == null ) return;
        if ( this.animation.playOnLoad === false ) return;
        this.animation?.resume();
        this.animation?.play(); 
    }
    protected onDisable(): void { this.animation?.resume(); }
}

