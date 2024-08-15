import { _decorator, Component, Node, Vec3, Size, Vec2, UITransform, EventHandler } from 'cc';
import {Orientation, Viewport} from '../utils/Viewport';
import { EDITOR, PREVIEW } from 'cc/env';
import { OrientationEditorTools } from './OrientationEditorTools';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('OrientationItem')
@executeInEditMode
export class OrientationItem {

    @property({displayName:'啟用資料'})
    public enable: boolean = true;

    @property({displayName: '座標', tooltip: '節點座標', visible:function(this:OrientationItem) { return this.enable === true; }})
    public position: Vec3 = new Vec3(0, 0, 0);
    
    @property({displayName: '縮放', tooltip: '節點縮放', visible:function(this:OrientationItem) { return this.enable === true;}})
    public scale: Vec3 = new Vec3(1, 1, 1);

    @property({displayName: '運作中不操作Active', tooltip: 'affectActive', visible:function(this:OrientationItem) { return this.enable === true;}})
    public affectActive: boolean = false;

    @property({displayName: 'Active', tooltip: 'active', visible:function(this:OrientationItem) { return (this.affectActive === false && this.enable === true); }})
    public active: boolean = true;

    @property({displayName: '父節點', tooltip: 'parentNode', visible:function(this:OrientationItem) { return this.enable === true;}})
    public parentNode : Node = null;

    @property({displayName: '有UITransform'})
    public hasUITransform: boolean = false;

    @property({displayName: 'ContentSize', tooltip: '節點UI Transform', visible:function(this:OrientationItem) { return (this.enable && this.hasUITransform);}})
    public contentSize: Size = new Size();
    
    @property({displayName: 'AnchorPoint', tooltip: '節點錨點', visible:function(this:OrientationItem) { return (this.enable && this.hasUITransform);}})
    public anchorPoint: Vec2 = new Vec2(0, 0);

    @property({displayName: '取得節點位置', tooltip: 'siblingIndex', visible:function(this:OrientationItem) { return this.enable === true;}})
    public siblingIndex: number;

    @property({displayName: '呼叫事件', tooltip: 'callEvent (orientation:Orientation, item:Node, customData)', visible:function(this:OrientationItem) { return this.enable === true;}})
    public callEvent : EventHandler = new EventHandler();
}


@ccclass('OrientationNode')
@executeInEditMode
export class OrientationNode extends Component {
    @property({displayName:'是否啟用轉向資料'})
    public enable : boolean = true;

    @property({displayName: '是否啟用自動儲存資料', tooltip:'在 OrientationEditorTool 啟用儲存, 會改變本資料內容'})
    public autoSave: boolean = true;

    @property({displayName: '橫版轉向資料', group:{name:'Landscape',id:'0'}, visible:function(this:OrientationNode) { return this.enable === true; }})
    public landscapeData: OrientationItem = new OrientationItem();

    @property({displayName: '直版轉向資料', group:{name:'Portrait',id:'0'}, visible:function(this:OrientationNode) { return this.enable === true; }})
    public portraitData: OrientationItem = new OrientationItem();

    @property({displayName: '儲存目前資料', tooltip: '儲存目前資料', visible:function(this:OrientationNode) { return this.enable === true; }})
    public get saveCurrentData() { return false; }
    public set saveCurrentData(value: boolean) {
        if ( EDITOR === false ) return;
        if (  OrientationEditorTools.instance?.orientation == null) {
            console.log('查無目前轉向資料');
            return;
        }
        
        this.saveOrientationItem(OrientationEditorTools.instance.orientation);
    }

    check() {
        if ( EDITOR === false ) return;
        if ( this.landscapeData.parentNode == null ) this.landscapeData.parentNode = this.node.parent;
        if ( this.portraitData.parentNode  == null ) this.portraitData.parentNode  = this.node.parent;
        if ( this.landscapeData.contentSize != null && this.portraitData.contentSize  == null ) this.portraitData.contentSize  = this.landscapeData.contentSize;
        if ( this.portraitData.contentSize  != null && this.landscapeData.contentSize == null ) this.landscapeData.contentSize = this.portraitData.contentSize;
        if ( this.landscapeData.anchorPoint != null && this.portraitData.anchorPoint  == null ) this.portraitData.anchorPoint  = this.landscapeData.anchorPoint;
        if ( this.portraitData.anchorPoint  != null && this.landscapeData.anchorPoint == null ) this.landscapeData.anchorPoint = this.portraitData.anchorPoint;
    }

    public saveOrientationItem(orientation: Orientation) :boolean {
        if ( EDITOR === false ) return;
        if ( this.autoSave !== true ) return;

        let orientationItem = orientation === Orientation.LANDSCAPE ? this.landscapeData : this.portraitData;
        orientationItem.position    = this.node.position.clone();
        orientationItem.scale       = this.node.scale.clone();
        orientationItem.active      = this.node.active;
        orientationItem.parentNode  = this.node.parent;
        orientationItem.siblingIndex = this.node.getSiblingIndex();

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            orientationItem.hasUITransform = false;
            orientationItem.contentSize = uiTransform.contentSize;
            orientationItem.anchorPoint = uiTransform.anchorPoint;
        } else {
            orientationItem.hasUITransform = false;
        }
        this.check();
        return true;
    }

    public changeOrientation(orientation: Orientation=null) {
        if ( orientation == null ) orientation = Viewport.instance.getCurrentOrientation();
        let orientationItem = orientation === Orientation.LANDSCAPE ? this.landscapeData : this.portraitData;

        if ( this.enable !== true ) {
            this.changeChildOrientation(orientation); 
            return -1;
        }

        if ( !orientationItem.affectActive ) this.node.active = orientationItem.active;
        if ( orientationItem.parentNode == null ) console.log('parentNode is null', this.node.name);
        if ( orientationItem.parentNode != null ) {
            this.node.setParent(orientationItem.parentNode);
            orientationItem.parentNode.addChild(this.node);
        }

        this.node.setPosition(orientationItem.position);
        this.node.setScale(orientationItem.scale);
        // this.node.setSiblingIndex(orientationItem.siblingIndex);

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform && orientationItem.hasUITransform) {
            uiTransform.setContentSize(orientationItem.contentSize);
            uiTransform.setAnchorPoint(orientationItem.anchorPoint);
        }

        this.changeChildOrientation(orientation);
        if ( orientationItem.callEvent != null ) orientationItem.callEvent.emit([orientation, this.node, orientationItem.callEvent.customEventData]);

        if ( EDITOR ) this.check();
        return orientationItem.siblingIndex;
    }

    public changeChildOrientation(orientation: Orientation) :boolean {
        let children = this.node.children;
        if ( children.length === 0 ) return true;

        let indexData : any = [];

        for(let i=0; i<children.length; i++) {
            let child = children[i];
            let orientationNode = child.getComponent(OrientationNode);
            if ( !orientationNode ) continue;

            indexData.push({
                'index' : orientationNode.changeOrientation(orientation),
                'node' : child,
                'orientationNode': orientationNode
            });
        }

        // 重新排序
        /*
        indexData.forEach((data:any) => {
            if ( data.index === -1 ) return;
            data.node.setSiblingIndex(data.index);
        });*/

        return true;
    }

}

