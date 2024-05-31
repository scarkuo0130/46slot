import { _decorator, Asset, AssetManager, CCBoolean, CCInteger, Component, Enum, find, Node, Quat, serializeTag, Size, UITransform, Vec2, Vec3 } from 'cc';
import {Orientation} from '../utils/Viewport';
const { ccclass, property, menu, help, disallowMultiple, executeInEditMode } = _decorator;
import { Utils, _utilsDecorator } from '../utils/Utils';
import { EditorTools } from './EditorTools';
const { isDevelopFunction } = _utilsDecorator;

@ccclass('OrientationData')
export class OrientationData {
    
    @property({type: String, displayName: '節點路徑', tooltip: '節點路徑'})
    public nodePath: string = '';

    @property({type: Vec3, displayName: '座標', tooltip: '節點世界座標'})
    public position: Vec3 = new Vec3(0, 0, 0);
    
    @property({type: Vec3, displayName: '縮放', tooltip: '節點世界縮放'})
    public scale: Vec3 = new Vec3(0, 0, 0);

    // @property({type: Quat, displayName: '旋轉', tooltip: '節點世界旋轉'})
    // public rotation: Quat = new Quat(0, 0, 0, 0);

    @property({type: CCBoolean, displayName: '啟用', tooltip: '節點是否啟用'})
    public active: boolean = true;

    @property({type: String, displayName: '父節點路徑', tooltip: '父節點路徑'})
    public parentPath: string = '';

    @property({type: String, displayName: 'UUID', tooltip: '節點UUID'})
    public uuid: string = '';

    @property({type:Node, displayName: '節點', tooltip: '節點'})
    public node: Node = new Node();

    @property({type: Size, displayName: 'UI Transform', tooltip: '節點UI Transform'})
    public contentSize: Size = new Size();
    
    @property({type: Vec2, displayName: '錨點', tooltip: '節點錨點'})
    public anchorPoint: Vec2 = new Vec2(0, 0);
}


@ccclass('OrientationEditorTools')
@executeInEditMode
export class OrientationEditorTools extends Component {
    @property({type: [OrientationData], displayName: '直版轉向資料', tooltip: '紀錄轉向資料'})
    public PortraitData = [];

    @property({type: [OrientationData], displayName: '橫版轉向資料', tooltip: '紀錄轉向資料'})
    public LandscapeData = [];

    private _orientation: Orientation = Orientation.PORTRAIT;
    @property({type:Enum(Orientation), displayName: '轉向設定', tooltip: '紀錄目前的轉向設定'})
    public set orientation(value: Orientation) {
        this._orientation = value;
        this.onOrientationChange(value);
    }

    public get orientation() { return this._orientation; }

    @property({type:CCBoolean, displayName: '儲存轉向資料', tooltip: '是否儲存轉向資料'})
    public set SaveOrientationData(value: boolean) {
        let canvas = find('Canvas');
        if ( canvas == null ) return;
        canvas.children.forEach( (child:Node) => OrientationEditorTools.instance.onCheckOrientationNode(this._orientation, child, this.saveOrientationData, 'Canvas') );
    }

    public get SaveOrientationData() { return false; }
    
    public static instance: OrientationEditorTools = null;
    public onLoad(): void { OrientationEditorTools.instance = this; }

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
            
            let uiTransform : UITransform = node.getComponent(UITransform);
            if ( uiTransform != null) {
                uiTransform.contentSize = new Size(item.contentSize);
                uiTransform.anchorPoint = new Vec2(item.anchorPoint);
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

