import { _decorator, Component, Node, NodePool, instantiate, Vec3, Material, sp } from 'cc';
import { _utilsDecorator } from '../utils/Utils';
const { ccclass, property, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('objectData')
export class objectData {
    @property({ displayName:"ID", tooltip:"(id)取出物件代號" })
    public id : number = 0;

    @property({ type:Node, displayName:"Node", tooltip:"(ob)物件原型" })
    public node : Node;
}

/**
 * @class ObjectPool
 * @description 物件池, 用來管理可重複利用物件的回收與取出
 */
@ccclass('ObjectPool')
@disallowMultiple(true)
export class ObjectPool extends Component {
    @property({displayName:'註冊物件原型', type:[objectData], tooltip:'registNodeArray'})
    public mapObjectList:objectData[] = [];

    public static Instance : ObjectPool;
    public static originNodeData = {};
    public static Pool = {};
    public _goAway : Vec3;

    public onLoad(): void {
        this._goAway = new Vec3(5000,5000,5000);
        ObjectPool.Instance = this;
        ObjectPool.originNodeData = {};
        ObjectPool.Pool = {};
        this.initNodeData();
    }
    
    public start(): void {
        this.node.active = false;
        this.debugPool();
    }

    /**
     * @description 初始化物件池
     */
    protected initNodeData() {
        if ( this.mapObjectList === null ) return;
        if ( this.mapObjectList.length === 0 ) return;

        for(let i in this.mapObjectList) {
            let nodeData : objectData = this.mapObjectList[i];
            if ( nodeData === null ) continue;
            let [id, node] = [nodeData.id, nodeData.node];
            ObjectPool.registerNode(id, node);
        }
    }

    /**
     * @description 註冊物件原型
     * @param id  {string | number} 物件代號
     * @param node { Node } 物件原型
     * @returns { boolean } 是否註冊成功
     */
    public static registerNode(id:string|number, node:Node) : boolean {
        if ( id == null || node == null || ObjectPool.originNodeData[id] ) return false;
    
        ObjectPool.originNodeData[id] = node;
        ObjectPool.Pool[id] = new NodePool();
        node.active = false;
    
        ObjectPool.Instance.node.addChild(node);
        return true;
    }

    @isDevelopFunction(true)
    public static debugConsole() {
        let pool = ObjectPool.Pool;
        let keys = Object.keys(pool);
        let data = {};
        let total = 0;
        keys.forEach((key)=>{ 
            let count = pool[key].size();
            total += count;
            data[key] = count;
        });
        console.log(ObjectPool.Instance);
        console.log('ObjectPool total:'+total, data);
        console.log('register:', ObjectPool.originNodeData);
    }

    @isDevelopFunction(true)
    public debugPool() {
        cc.objectPool = ObjectPool;
        return ObjectPool.debugConsole();
    }

    /**
     * @description 取出物件
     * @param id {string | number} 物件代號
     * @returns { Node } 取出物件
     */
    public static Get(id) {
        if ( id == null ) return null;

        let pool:NodePool = ObjectPool.Pool[id];
        if ( pool != null && pool.size() > 0 ) {
            return pool.get();
        } 

        if ( ObjectPool.originNodeData[id] == null ) return null;
        return instantiate(ObjectPool.originNodeData[id]);
    }

    /**
     * @description 回收物件
     * @param id {string | number} 物件代號
     * @param ob { Node } 物件
     */
    public static Put(id:string|number, ob:Node) {
        if ( ob == null || id == null ) return;
        
        let pool = ObjectPool.Pool[id];
        if ( pool == null ) pool = ObjectPool.Pool[id] = new NodePool();
        
        ob.active = false;
        ObjectPool.Instance.node.addChild(ob);
        ob.setPosition(this.Instance._goAway);
        pool.put(ob);
    }
}

