import { _decorator, Asset, AssetManager, CCBoolean, CCInteger, Component, Enum, EventHandler, find, instantiate, Node, Quat, serializeTag, Size, UITransform, Vec2, Vec3 } from 'cc';
import {Orientation, Viewport} from '../utils/Viewport';
const { ccclass, property, menu, help, disallowMultiple, executeInEditMode } = _decorator;
import { Utils, _utilsDecorator } from '../utils/Utils';
const { isDevelopFunction } = _utilsDecorator;

@ccclass('OrientationData')
export class OrientationData {
    
    @property({displayName: '節點路徑', tooltip: '節點路徑'})
    public nodePath: string = '';

    @property({displayName: '座標', tooltip: '節點世界座標'})
    public position: Vec3 = new Vec3(0, 0, 0);
    
    @property({displayName: '縮放', tooltip: '節點世界縮放'})
    public scale: Vec3 = new Vec3(0, 0, 0);

    @property({displayName: '啟用', tooltip: 'active'})
    public active: boolean = true;

    @property({displayName: '父節點路徑', tooltip: 'parentPath'})
    public parentPath: string = '';

    @property({displayName: '父節點', tooltip: 'parentNode'})
    public parentNode : Node = null;

    @property({displayName: 'UUID', tooltip: 'uuid'})
    public uuid: string = '';

    @property({type:Node, displayName: '節點', tooltip: 'node'})
    public node: Node = new Node();

    @property({displayName: 'UI Transform', tooltip: '節點UI Transform'})
    public contentSize: Size = new Size();
    
    @property({displayName: '錨點', tooltip: '節點錨點'})
    public anchorPoint: Vec2 = new Vec2(0, 0);
}


@ccclass('OrientationEditorTools')
@disallowMultiple(true)
@executeInEditMode
export class OrientationEditorTools extends Component {
    @property({type: [OrientationData], displayName: '直版轉向資料', tooltip: 'PortraitData'})
    public PortraitData = [];

    @property({type: [OrientationData], displayName: '橫版轉向資料', tooltip: 'LandscapeData'})
    public LandscapeData = [];

    @property({type:[Node], displayName: '紀錄節點', tooltip: 'saveNodes' })
    public saveNodes: Node[] = [];

    private _orientation: Orientation = Orientation.PORTRAIT;
    @property({type:Enum(Orientation), displayName: '轉向設定', tooltip: '紀錄目前的轉向設定'})
    public set orientation(value: Orientation) {
        this._orientation = value;
        this.onOrientationChange(value);
    }

    public get orientation() { return this._orientation; }

    @property({type:CCBoolean, displayName: '儲存轉向資料', tooltip: '是否儲存轉向資料'})
    public set SaveOrientationData(value: boolean) {
        if ( this.saveNodes.length === 0 ) return;
        this.saveNodes.forEach( (node:Node) => OrientationEditorTools.instance.onCheckOrientationNode(this._orientation, node, this.saveOrientationData, 'Canvas') );
    }
    public get SaveOrientationData() { return false; }
    public viewport : Viewport;
    public static instance: OrientationEditorTools = null;
    public onLoad(): void { 
        OrientationEditorTools.instance = this; 
        this.viewport = Viewport.instance;

        let event             = new EventHandler();
        event.target          = this.node;
        event.component       = 'OrientationEditorTools';
        event.handler         = 'onOrientationChange';
        event.customEventData = '';
        this.viewport.addOrientationChangeEventHandler(event);
    }

    // 變更轉向設定
    onOrientationChange( orientation: Orientation ): void {
        let orientationData = orientation === Orientation.PORTRAIT ? this.PortraitData : this.LandscapeData;
        if ( orientationData == null ) return;

        orientationData.forEach( (item:OrientationData) => {
            let node = find(item.nodePath);
            if ( node == null ) return;

            node.active = item.active;
            node.setPosition(item.position);
            node.setScale(item.scale);
            node.parent = item.parentNode;
            
            let uiTransform : UITransform = node.getComponent(UITransform);
            if ( uiTransform != null ) {
                uiTransform.contentSize = item.contentSize;
                uiTransform.anchorPoint = item.anchorPoint;
            }
        });
    }

    onCheckOrientationNode( orientation: Orientation, node:Node, callEvent:Function, parentPath:string ): void {
        callEvent(orientation, node, parentPath);

        let children = node.children;
        if ( children.length === 0 ) return;
        children.forEach( (child:Node) => { OrientationEditorTools.instance.onCheckOrientationNode(orientation, child, callEvent, parentPath); } );
    }
    
    saveOrientationData( orientation: Orientation, node:Node, parentPath:string ): void {
        if ( node == null ) return;

        let orientationData;
        if ( orientation === Orientation.PORTRAIT ) orientationData = OrientationEditorTools.instance.PortraitData;
        else if ( orientation === Orientation.LANDSCAPE ) orientationData = OrientationEditorTools.instance.LandscapeData;

        if ( orientationData == null ) orientationData = {};

        let path = node.getPathInHierarchy();
        let data = orientationData.find( (item:OrientationData) => item.nodePath === path );

        if ( data == null ) {
            data = new OrientationData();
        } else {
            orientationData = orientationData.filter( (item:OrientationData) => item.nodePath !== path );
        }

        data.nodePath = path;
        data.active = node.active;
        data.position = new Vec3(node.position);
        data.scale = new Vec3(node.scale);
        data.parentPath = parentPath;
        data.uuid = node.uuid;
        data.active = node.active;
        data.parentNode = node.parent;

        let uiTransform : UITransform = node.getComponent(UITransform);
        if ( uiTransform != null ) {
            data.contentSize = new Size(uiTransform.contentSize);
            data.anchorPoint = new Vec2(uiTransform.anchorPoint);
        }
        
        data.node = node;
        
        orientationData.push(data);
        if ( orientation === Orientation.PORTRAIT ) OrientationEditorTools.instance.PortraitData = orientationData;
        else if ( orientation === Orientation.LANDSCAPE ) OrientationEditorTools.instance.LandscapeData = orientationData;
    }
}

