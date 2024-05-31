import { _decorator, Component, Node, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('spineOnEnable')
export class spineOnEnable extends Component {
    @property({displayName:'Animation', tooltip:'啟動時播放哪個特效名稱'})
    public animation = '';
    public origonAnimation = {};

    protected spineList : any[];

    onLoad() {
        let spinList : any[] = this.node.getComponents(sp.Skeleton);
        let spineChildList :any[] = this.node.getComponentsInChildren(sp.Skeleton);

        if (spinList == null) spinList = [];
        if (spineChildList == null) spineChildList = [];
        this.spineList = [];
        this.spineList.push(spinList);
        this.spineList.push(spineChildList);

        for(let i in this.spineList) {
            let spine :sp.Skeleton = this.spineList[i];
            let id = i
            let ani = spine.animation;
            this.origonAnimation[id] = spine._animationIndex;
        }
    }

    protected onEnable(): void {
        if ( this.spineList == null ) return;
        if ( this.spineList.length == 0 ) return;
        if ( this.animation.length == 0 ) return;
        let ani = this.animation;

        for(let i in this.spineList) {
            let spine : sp.Skeleton = this.spineList[i];
            if ( spine == null ) continue;
            spine.animation = '';
            spine.animation = ani;
            
        }
    }
}

