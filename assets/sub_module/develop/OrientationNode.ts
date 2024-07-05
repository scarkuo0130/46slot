import { _decorator, Component, Node, Vec3, Size, Vec2, UITransform } from 'cc';
import {Orientation} from '../utils/Viewport';
import { EDITOR, PREVIEW } from 'cc/env';
import { OrientationEditorTools } from './OrientationEditorTools';
const { ccclass, property } = _decorator;

@ccclass('OrientationItem')
export class OrientationItem {

    @property({displayName:'啟用資料'})
    public enable: boolean = true;

    @property({displayName: '座標', tooltip: '節點座標', visible:function(this:OrientationItem) { return this.enable === true; }})
    public position: Vec3 = new Vec3(0, 0, 0);
    
    @property({displayName: '縮放', tooltip: '節點縮放', visible:function(this:OrientationItem) { return this.enable === true;}})
    public scale: Vec3 = new Vec3(0, 0, 0);

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
}


@ccclass('OrientationNode')
export class OrientationNode extends Component {
    @property({displayName:'是否啟用轉向資料'})
    public enable : boolean = true;

    @property({displayName: '是否啟用自動儲存資料', tooltip:'在 OrientationEditorTool 啟用儲存, 會改變本資料內容'})
    public autoSave: boolean = true;

    @property({displayName: '橫版轉向資料', group:{name:'Landscape',id:'0'}})
    public landscapeData: OrientationItem = new OrientationItem();

    @property({displayName: '直版轉向資料', group:{name:'Portrait',id:'0'}})
    public portraitData: OrientationItem = new OrientationItem();

    @property({displayName: '儲存目前資料', tooltip: '儲存目前資料'})
    public get saveCurrentData() { return false; }
    public set saveCurrentData(value: boolean) {
        if ( EDITOR === false ) return;
        if (  OrientationEditorTools.instance?.orientation == null) {
            console.log('查無目前轉向資料');
            return;
        }
        
        this.saveOrientationItem(OrientationEditorTools.instance.orientation);
    }

    public saveOrientationItem(orientation: Orientation) :boolean{
        if ( this.autoSave !== true ) return;

        let orientationItem = orientation === Orientation.LANDSCAPE ? this.landscapeData : this.portraitData;
        orientationItem.position    = this.node.position.clone();
        orientationItem.scale       = this.node.scale.clone();
        orientationItem.active      = this.node.active;
        orientationItem.parentNode  = this.node.parent;

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            orientationItem.hasUITransform = true;
            orientationItem.contentSize = uiTransform.contentSize;
            orientationItem.anchorPoint = uiTransform.anchorPoint;
        } else {
            orientationItem.hasUITransform = false;
        }

        return true;
    }

    public changeOrientation(orientation: Orientation) :boolean {
        if ( this.enable !== true ) return this.changeChildOrientation(orientation); 

        let orientationItem = orientation === Orientation.LANDSCAPE ? this.landscapeData : this.portraitData;

        if ( !orientationItem.affectActive ) this.node.active = orientationItem.active;
        this.node.setPosition(orientationItem.position);
        this.node.setScale(orientationItem.scale);

        if ( orientationItem.parentNode != null && orientationItem.parentNode !== this.node.parent ) {
            this.node.setParent(orientationItem.parentNode);
        }

        let uiTransform = this.node.getComponent(UITransform);
        if (uiTransform && orientationItem.hasUITransform) {
            uiTransform.setContentSize(orientationItem.contentSize);
            uiTransform.setAnchorPoint(orientationItem.anchorPoint);
        }

        return this.changeChildOrientation(orientation);
    }

    public changeChildOrientation(orientation: Orientation) :boolean {
        let children = this.node.children;
        if ( children.length === 0 ) return true;

        for(let i=0; i<children.length; i++) {
            let child = children[i];
            let orientationNode = child.getComponent(OrientationNode);
            if ( orientationNode ) orientationNode.changeOrientation(orientation);
        }

        return true;
    }

}

