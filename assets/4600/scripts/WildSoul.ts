import { _decorator, Component, Node, sp } from 'cc';
import { Utils } from '../../sub_module/utils/Utils';
const { ccclass, property } = _decorator;

@ccclass('WildSoul')
export class WildSoul extends Component {
    public skeleton: sp.Skeleton = null;
    private animation_list = ['play', 'play02', 'play03'];


    public onEnable(): void {
        if ( this.skeleton == null )this.skeleton = this.getComponent(sp.Skeleton);
        
        const random = Utils.Random(0, this.animation_list.length);
        const animation = this.animation_list[random];
        console.log('animation:', animation);
        Utils.playSpine(this.skeleton, animation, true);
    }
}

