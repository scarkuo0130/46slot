import { _decorator, CCBoolean, Color, Component, EventHandler, Node, Sprite, tween, Vec3 } from 'cc';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('switchButton')
export class switchButton extends Component {
    @property({ displayName:'ButtonNode', type:Node })
    private buttonNode: Node;

    @property({ displayName:'Default Active',type:CCBoolean })
    private defaultActive : boolean;

    @property({group:{name:'active', displayOrder:0}, displayName:'ActivePosition'})
    private activePos: Vec3;

    @property({group:{name:'active', displayOrder:0}, displayName:'ActiveColor'})
    private activeColor: Color;

    @property({group:{name:'active', displayOrder:0}, displayName:'ActiveButtonColor'})
    private activeButtonColor: Color;

    @property({displayName:'ActiveEventHandler', type:[EventHandler] })
    private activeEventHandler: EventHandler[] = [];

    @property({group:{name:'nonActive', displayOrder:1}, displayName:'NonActivePosition'})
    private nonActivePos: Vec3;

    @property({group:{name:'nonActive', displayOrder:1}, displayName:'NonActiveColor'})
    private nonActiveColor: Color;

    @property({group:{name:'nonActive', displayOrder:1}, displayName:'NonActiveButtonColor'})
    private nonActiveButtonColor: Color;

    public addActiveEventHandler(handler:EventHandler) { this.activeEventHandler.push(handler); }

    private nowActive: boolean;
    private mainSprite: Sprite;
    private buttonSprite: Sprite;

    public get Active() : boolean { return this.nowActive; }

    protected onLoad(): void {
        this.mainSprite = this.getComponent<Sprite>(Sprite);
        this.buttonSprite = this.buttonNode.getComponent<Sprite>(Sprite);
        this.node.on(Node.EventType.TOUCH_END, this.click, this);
        Utils.AddHandHoverEvent(this.node);
    }

    protected start() {
        this.switch(this.defaultActive);
    }

    public switch(act:boolean) {
        if ( this.buttonNode   == null)  return;
        if ( this.nowActive    === act ) return;
        if ( this.mainSprite   == null ) return;
        if ( this.buttonSprite == null ) return;

        let button = this.buttonNode;
        this.nowActive = act;
        if ( act === true ) {
            this.mainSprite.color = this.activeColor;
            this.buttonSprite.color = this.activeButtonColor;
            tween(button).to(0.2, {position:this.activePos}, {easing:'backInOut'}).start();
            
        } else {
            this.mainSprite.color = this.nonActiveColor;
            this.buttonSprite.color = this.nonActiveButtonColor;
            tween(button).to(0.2, {position:this.nonActivePos}, {easing:'backInOut'}).start();
        }
    }

    click() {
        let act = !this.nowActive;
        this.switch(act);
        if ( this.activeEventHandler.length > 0 ) {
            for(let i in this.activeEventHandler) this.activeEventHandler[i].emit([act]);
        }
    }
}

