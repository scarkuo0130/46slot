import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WildSoul')
export class WildSoul extends Component {
    public skeleton: sp.Skeleton = null;
    private animation_list = ['animation', 'animation2', 'animation3'];

    protected onLoad(): void {
        this.skeleton = this.getComponent(sp.Skeleton);
        const random = Math.floor(Math.random() * this.animation_list.length);
        this.skeleton.setAnimation(0, this.animation_list[random], true);
    }

    private onEnable(): void {
        const random = Math.floor(Math.random() * this.animation_list.length);
        this.skeleton.setAnimation(0, this.animation_list[random], true);
    }
}

