import { _decorator, Component, Color, Sprite, Material, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Lightning')
export class Lightning extends Component {
    deltaTime : number = 0;
    @property({ type:Sprite })
    public lightning : Sprite;

    @property({ displayName:'FromColor' })
    public fromColor: Color;

    @property({ displayName:'ToColor' })
    public toColor: Color;

    public material : Material;

    onLoad() {
        this.material = this.lightning.getSharedMaterial(0);
    }

    update(deltaTime: number) {
        this.deltaTime += 0.2;
        // let material = this.lightning.getSharedMaterial(0);
        this.material.setProperty("time", this.deltaTime);
    }

    tweenColor(sec) {
        this.lightning.color = new Color(200,200,200,180);
        let data = {value:200};
        //this.lightning.color = new Color(96,200,96,180);
        //let data = {value:0};
        let self = this;
        tween(data).to(sec, {value:96}, {onUpdate(target, ratio) {
            let color:Color = new Color(data.value,200,data.value,180);
            self.lightning.color = color;
        },}).start();
    }
}

