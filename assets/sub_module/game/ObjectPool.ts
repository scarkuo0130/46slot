import { _decorator, Component, Node, NodePool, instantiate, Vec3, Material, sp } from 'cc';
import { Utils, _utilsDecorator } from '../utils/Utils';
import { Symbol } from '../game/machine/Symbol';
import { SCATTER_ID, WILD_ID } from './GameInformation';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('ObjectPool_ObjectData')
export class ObjectPool_ObjectData {
    @property({ displayName:"ID", tooltip:"(id)取出物件代號" })
    public id : number = 0;

    @property({ type:Node, displayName:"Node", tooltip:"(ob)物件原型" })
    public ob : Node;
}


@ccclass('ObjectPool')
export class ObjectPool extends Component {
    @property({displayName:'RegistNodeID', type:[ObjectPool_ObjectData], tooltip:'(registNodeArray)設定物件原型'})
    public registNodeArray:ObjectPool_ObjectData[] = [];

    public static Instance : ObjectPool;
    public static RegistNodeData = {};
    public static Pool = {};
    public _goAway : Vec3;

    @property({type:Material})
    public materialGray:Material ;
    @property({type:Material})
    public materialSpine:Material ;
    @property
    public grayMode:boolean = false ;

    public onLoad(): void {
        this._goAway = new Vec3(5000,5000,5000);
        ObjectPool.Instance = this;
        ObjectPool.RegistNodeData = {};
        ObjectPool.Pool = {};
        this.initNodeData();
    }

    public start(): void {
        this.node.active = false;
        this.debugPool();
    }

    protected initNodeData() {
        if ( this.registNodeArray === null ) return;
        if ( this.registNodeArray.length === 0 ) return;

        for(let i in this.registNodeArray) {
            let nodeData : ObjectPool_ObjectData = this.registNodeArray[i];
            if ( nodeData === null ) continue;
            let id = nodeData.id;
            let node = nodeData.ob;
            ObjectPool.registerNode(id, node);
        }
    }

    public static registerNode(id:string, node:Node) : boolean {
        if ( !id?.length ) return false;
        if ( node == null ) return false;
        if ( ObjectPool.RegistNodeData[id] ) return false;

        ObjectPool.RegistNodeData[id] = node;
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
        console.log('register:', ObjectPool.RegistNodeData);
    }

    @isDevelopFunction(true)
    public debugPool() {
        cc.objectPool = ObjectPool;
        return ObjectPool.debugConsole();
    }

    public static Get(id) {
        if ( id == null ) return null;
        let ob;
        let pool:NodePool = ObjectPool.Pool[id];

        if ( ObjectPool.Pool[id] != null && pool.size() > 0 ) {
            ob = pool.get();
            
        } else {
            if ( ObjectPool.RegistNodeData[id] == null ) return null;
            ob = instantiate(ObjectPool.RegistNodeData[id]);
        }
        this.onGray(ob);
        return ob;
    }

    public static Put(id:any, ob:Node) {
        if ( ob == null ) return;
        if ( id == null ) return;

        if ( ObjectPool.Pool[id] == null ) ObjectPool.Pool[id] = new NodePool();
        
        ob.active = false;
        ObjectPool.Instance.node.addChild(ob);
        ob.setPosition(this.Instance._goAway);

        ObjectPool.Pool[id].put(ob);
    }

    public static PutSymbols(obs:Node[]) {
        if ( !obs?.length ) return;

        for(let i in obs) {
            let ob = obs[i];
            if ( ob == null ) continue;
            let id = ob.getComponent('Symbol').id;
            ObjectPool.Put(id, ob);
        }
    }
    
    public static setGray(set:boolean) { this.Instance.grayMode = set ;}
    public static onGray(ob:any) {
        let symbol = (ob as Node).getComponent( Symbol );
        if (symbol !== null){
            if  (WILD_ID === (symbol.symID)) return ;
            if  (SCATTER_ID === (symbol.symID)) return ;
            let spine = symbol.inscept.spineInscept.spine.getComponent<sp.Skeleton>( sp.Skeleton );
            if (this.Instance.grayMode === true) 
                spine.customMaterial = this.Instance.materialGray ;
            else
                spine.customMaterial = this.Instance.materialSpine ;    
        } 
    }
}

