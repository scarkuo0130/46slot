import { _decorator, ccenum, Component, EventHandler, Node, Vec2, Vec3 } from 'cc';
import { Viewport, Orientation } from '../utils/Viewport';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('landscapeItem')
export class ScreenRotationItem {
    @property({displayName:'Enable', tooltip:'是否生效'})
    public enable: boolean = true;

    @property({displayName:'Name', tooltip:'純粹辨識使用,可不填(但最好記住這筆資料是什麼)' })
    public name: string = '';

    @property({displayName:'Memo', tooltip:'額外紀錄訊息,辨識使用'})
    public memo: string = '';

    @property({ type: Node, displayName:'TargetNode', tooltip:'轉移物件'})
    public targetNode : Node;

    @property({ type: Node, displayName:'MoveTarget', tooltip:'目標位置', group:{name:'moveToTaret', id:'1'} })
    public landscapeParentNode: Node;

    @property({ displayName:'MoveVec3', tooltip:'座標位置', group:{name:'moveToPosition', id:'1'} })
    public landscapeVec3: Vec3 = new Vec3(0,0,0);

    @property({ type: [EventHandler], displayName:'CallEvents', tooltip:'呼叫函式' })
    public callEvents: EventHandler[] = [];

    @property({displayName:'ChangeScale', tooltip:'改變大小' })
    public changeScale: Vec3 = new Vec3(1,1,1);

    @property({ displayName:'Active', group:{name:'Portrait', id:'2'} })
    public portraitActive :boolean = true;

    @property({ displayName:'Active', group:{name:'Landscape', id:'2'} })
    public landscapeActive :boolean = true;

    /// 紀錄直版位置
    public portraitVec3:Vec3;
    public portraitParentNode : Node;
}

@ccclass('ScreenRotation')

@disallowMultiple(true)
@menu('SlotMachine/ScreenRotation')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.pgbicfih14ac')
/**
 * 版面置換系統
 * * 開發時請使用直版進行開發
 * * 需要橫版在使用設定拉到相對位置
 * todo 1. 記住直版位置
 * todo 2. 接收到版面置換時，將物件置換到指定位置
 * todo 3. 可以指定置換後需要呼叫的函式
 */
export class ScreenRotation extends Component {

    @property({type:[ScreenRotationItem], displayName:'LandscapeMoveItem', tooltip:'橫版時移動位置'})
    public landscapeItems : ScreenRotationItem[] = [];

    public viewport : Viewport;

    onLoad() {
        this.initItems();
        this.viewport = Viewport.instance;

        let event = new EventHandler();
        event.target = this.node;
        event.component = 'ScreenRotation';
        event.handler = 'onOrientationChange';
        event.customEventData = '';
        this.viewport.addOrientationChangeEventHandler(event);
        //this.viewport.onOrientationChangeSignal.add(this.onOrientationChange);
    }

    initItems() {
        if ( this.landscapeItems == null ) return;
        if ( this.landscapeItems.length == 0 ) return;

        for(let i in this.landscapeItems ) {
            let item = this.landscapeItems[i];
            if ( item.targetNode == null ) continue;
            let target = item.targetNode;
            let targetPos = item.targetNode.getPosition();
            item.portraitVec3 = new Vec3(targetPos.x, targetPos.y, targetPos.z);
            item.portraitParentNode = target.parent;
        }
    }

    start() {
        setTimeout(() => {
            this.onOrientationChange(this.viewport.getCurrentOrientation());
        }, 100);
    }

    public onOrientationChange(orientation: Orientation) {
        console.log('onOrientationChange', this.node.name, orientation);
        return this.moveItems(orientation);
    }

    public moveItems(orientation: Orientation) {
        if ( this.landscapeItems == null ) return;
        if ( this.landscapeItems.length == 0 ) return;

        for(let i in this.landscapeItems ) {
            let item = this.landscapeItems[i];
            if ( item.enable != true ) continue;
            if ( item.targetNode == null ) continue;
            let taregt = item.targetNode;

            if ( orientation == Orientation.PORTRAIT ) {
                taregt.setParent(item.portraitParentNode);
                taregt.setPosition(item.portraitVec3);
                taregt.setScale(Vec3.ONE);
                taregt.active = item.portraitActive;
            } else {
                if ( item.landscapeParentNode != null ) {
                    taregt.setParent(item.landscapeParentNode);
                    taregt.setPosition(Vec3.ZERO);

                } else {
                    taregt.setPosition(item.landscapeVec3);
                }
                
                taregt.setScale(item.changeScale);
                taregt.active = item.landscapeActive;
            }

            if ( item.callEvents != null ) {
                item.callEvents.forEach(event => {event.emit([orientation, event.customEventData])});
            }
        }
    }
}

