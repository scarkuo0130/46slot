import { _decorator, CCFloat, CCInteger, Component, EventHandler, EventTarget, Node } from 'cc';
import { Utils, _utilsDecorator } from '../../utils/Utils';
import { Wheel } from './Wheel';
import { Symbol } from './Symbol';
import { objectPrototype } from 'mobx/dist/internal';
import { Machine2_0 } from './Machine2.0';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

/** 滾輪狀態 */
export enum REEL_STATE {
    INIT_STATE = -1,    // 初始化狀態
    NORMAL_STATE = 0,   // 正常狀態
    SPINING_STATE = 1,  // 開始滾動狀態
    STOPING_STATE = 2,  // 停止滾動狀態
    WIN_STATE = 3,      // 表演狀態
}

/** 速度設定 */
export enum SPIN_MODE {
    NORMAL_MODE = 0,
    QUICK_MODE = 1,
    TURBO_MODE = 2,
}

export const SPIN_MODE_DATA = [ SPIN_MODE.NORMAL_MODE, SPIN_MODE.QUICK_MODE, SPIN_MODE.TURBO_MODE ];

/**
 * 啟動滾輪設定
 */
@ccclass('StartRollingInspect')
export class StartRollingInspect {
    
    @property ({displayName:'是否自定義每輪啟動時間', tooltip:'是否自定義每輪啟動時間'})
    public isCustomRollingTime: boolean = false;

    @property ({type:[CCFloat], displayName:'Normal', tooltip:'自定義 Normal 速度的啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_n : number[] = [0,0.3,0.6,0.9,1.2];

    @property ({type:[CCFloat], displayName:'Quick', tooltip:'自定義 Quick 速度的啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_q : number[] = [0,0.2,0.4,0.6,0.8,];

    @property ({type:[CCFloat], displayName:'Turbo', tooltip:'自定義 Turbo 速度的啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_t : number[] = [0,0,0,0,0];

    @property ({ displayName:'Normal', tooltip:'固定啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_n = 0.2;

    @property ({ displayName:'Quick', tooltip:'固定啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_q = 0.1;

    @property ({ displayName:'Turbo', tooltip:'固定啟動時間',group:{name:'啟動時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_t = 0;
}

@ccclass('StopRollingInspect')
export class StopRollingInspect {
    @property ({displayName:'是否自定義每輪停止時間', tooltip:'是否自定義每輪停止時間'})
    public isCustomRollingTime: boolean = false;

    @property ({type:[CCFloat], displayName:'Normal', tooltip:'自定義 Normal 速度的停止時間',group:{name:'停止時間設定'}, visible: function(this: StopRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_n : number[] = [0,0.3,0.6,0.9,1.2];

    @property ({type:[CCFloat], displayName:'Quick', tooltip:'自定義 Quick 速度的停止時間',group:{name:'停止時間設定'}, visible: function(this: StopRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_q : number[] = [0,0.2,0.4,0.6,0.8,];

    @property ({type:[CCFloat], displayName:'Turbo', tooltip:'自定義 Turbo 速度的停止時間',group:{name:'停止時間設定'}, visible: function(this: StopRollingInspect){ return this.isCustomRollingTime; }})
    public customRollingTime_t : number[] = [0,0,0,0,0];

    @property ({ displayName:'Normal', tooltip:'固定啟動時間',group:{name:'停止時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_n = 0.2;

    @property ({ displayName:'Quick', tooltip:'固定啟動時間',group:{name:'停止時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_q = 0.1;

    @property ({ displayName:'Turbo', tooltip:'固定啟動時間',group:{name:'停止時間設定'}, visible: function(this: StartRollingInspect){ return !this.isCustomRollingTime; }})
    public rollingTime_t = 0;
}

@ccclass('RollingInspect')
export class RollingInspect {

    @property ({displayName:'Normal', tooltip:'持續滾動時間', group:{'name':'持續滾動設定'}})
    public rollingTime_n = 0.5;

    @property ({displayName:'Quick', tooltip:'持續滾動時間', group:{'name':'持續滾動設定'}})
    public rollingTime_q = 0.3;

    @property ({displayName:'Turbo', tooltip:'持續滾動時間', group:{'name':'持續滾動設定'}})
    public rollingTime_t = 0.1;
}

@ccclass('SymbolNearMiss')
export class SymbolNearMiss {
    @property ({displayName:'Symbol ID', tooltip:'聽牌Symbol'})
    public symbol: number = 0;

    @property ({displayName:'聽牌數量', tooltip:'>= 設定數量時觸發聽牌事件'})
    public count: number = 2;
}

@ccclass('SymbolInspect')
export class SymbolInspect {

    @property ({type:[CCInteger], displayName:'停輪表演 Symbol ID', tooltip:'哪些圖標停輪後要破框與表演'})
    public isDropSymbol: number[] = [0];

    @property ({type:Node, displayName:'表演位置', tooltip:'停輪後要破框與表演的位置'})
    public container: Node;

    @property ({type:[SymbolNearMiss], displayName:'聽牌Symbol設定', tooltip:'哪些Symbol要做聽牌效果'})
    public symbolNearMiss: SymbolNearMiss[] = [];
}

@ccclass('Reel')
export class Reel extends Component {
    @property ({type:Node, displayName:'滾輪容器', tooltip:'滾輪容器', group:{'name':'滾輪容器'}})
    private mContainer = null;

    @property ({displayName:'啟動設定', tooltip:'啟動設定', group:{'name':'啟動設定'}})
    protected startRollingInspect: StartRollingInspect = new StartRollingInspect();

    @property ({displayName:'停止設定', tooltip:'停止設定', group:{'name':'停止設定'}})
    protected stopRollingInspect: StopRollingInspect = new StopRollingInspect();

    @property ({displayName:'滾動設定', tooltip:'滾動設定', group:{'name':'滾動設定'}})
    protected rollingInspect: RollingInspect = new RollingInspect();

    @property ({displayName:'Symbol設定', tooltip:'Symbol設定', group:{'name':'Symbol設定與聽牌設定'}})
    protected symbolInspect: SymbolInspect = new SymbolInspect();

    protected properties: any = {
        machine         : null,   // 機台 { Machine }
        container       : null,   // 滾輪容器 { Node }
        wheels          : [],     // 滾輪 { Wheel[] }
        result          : [],     // 盤面結果 { number[][] }
        nearMiss        : null,   // 聽牌滾輪 { number }
        stopingWheel    : [],     // 正在停輪滾輪 { number[false,false,.....] }
        isFastStoping   : false,  // 是否快速停輪 { boolean }
        showDropSymbols : [],     // 顯示破框表演的 Symbol { wheelID: Node[] }
        state           : REEL_STATE.INIT_STATE, // 滾輪狀態
        mode            : SPIN_MODE.NORMAL_MODE, // 速度設定 
        handler : {
            stoping : null,       // 等待停止的 Handler
        },
        
        startRolling :{
            [SPIN_MODE.NORMAL_MODE] : [],  // 啟動時間設定 [ {wheelID:0,time:0} ]
            [SPIN_MODE.QUICK_MODE]  : [],  // 啟動時間設定
            [SPIN_MODE.TURBO_MODE]  : [],  // 啟動時間設定
        },

        stopRolling : {}, // 停止時間設定

        rolling: {
            [SPIN_MODE.NORMAL_MODE] : 0, // 持續滾動時間
            [SPIN_MODE.QUICK_MODE]  : 0, // 持續滾動時間
            [SPIN_MODE.TURBO_MODE]  : 0, // 持續滾動時間
        },
    };

    protected onLoad() {
        this.properties.container = this.mContainer;
        this.changeState(REEL_STATE.INIT_STATE);
        Machine2_0.SetReel(this);
    }

    protected start() {
        this.initWheel();
        this.initStartRollingData();
        this.initStopRollingData();
        this.initRollingTime();
        this.changeState(REEL_STATE.NORMAL_STATE);
        this.initNodeData();

        this.developStart();
    }

    @isDevelopFunction(true)
    private developStart() { cc.reel = this; }

    private initNodeData() {
        Object.defineProperty(this.node, 'reel',    { get: () => this });
        Object.defineProperty(this.node, 'machine', { get: () => this.properties.machine });
        Object.defineProperty(this.node, 'wheels',  { get: () => this.getWheels() });
    }

    public getWheels (): Wheel[] { return this.properties.wheels; }


    private initRollingTime() {
        this.properties.rolling[SPIN_MODE.NORMAL_MODE] = this.rollingInspect.rollingTime_n * 1000;
        this.properties.rolling[SPIN_MODE.QUICK_MODE]  = this.rollingInspect.rollingTime_q * 1000;
        this.properties.rolling[SPIN_MODE.TURBO_MODE]  = this.rollingInspect.rollingTime_t * 1000;
    }
    /**
     * @description 初始化滾輪
     */
    private initWheel() {
        this.properties.wheels = this.container.getComponentsInChildren(Wheel);
        let wheels = this.getWheels();
        let self = this;
        this.properties.showDropSymbols = Array(wheels.length).fill([]);
        wheels.forEach((wheel, index) => { wheel.setReel(index, self); });

    }

    /**
     * @description 初始化滾輪啟動時間
     */
    private initStartRollingData() {
        if ( this.startRollingInspect.isCustomRollingTime === false ) {
            this.properties.startRolling[SPIN_MODE.NORMAL_MODE] = this.unifyRollingTime(this.startRollingInspect.rollingTime_n * 1000);
            this.properties.startRolling[SPIN_MODE.QUICK_MODE]  = this.unifyRollingTime(this.startRollingInspect.rollingTime_q * 1000);
            this.properties.startRolling[SPIN_MODE.TURBO_MODE]  = this.unifyRollingTime(this.startRollingInspect.rollingTime_t * 1000);
        } else {
            this.properties.startRolling[SPIN_MODE.NORMAL_MODE] = this.reckonRollingData(this.startRollingInspect.customRollingTime_n);
            this.properties.startRolling[SPIN_MODE.QUICK_MODE]  = this.reckonRollingData(this.startRollingInspect.customRollingTime_q);
            this.properties.startRolling[SPIN_MODE.TURBO_MODE]  = this.reckonRollingData(this.startRollingInspect.customRollingTime_t);
        }
    }

    /**
     * @description 初始化滾輪停止時間
     */
    private initStopRollingData() {
        if ( this.stopRollingInspect.isCustomRollingTime === false ) {
            this.properties.stopRolling[SPIN_MODE.NORMAL_MODE] = this.unifyRollingTime(this.stopRollingInspect.rollingTime_n * 1000);
            this.properties.stopRolling[SPIN_MODE.QUICK_MODE]  = this.unifyRollingTime(this.stopRollingInspect.rollingTime_q * 1000);
            this.properties.stopRolling[SPIN_MODE.TURBO_MODE]  = this.unifyRollingTime(this.stopRollingInspect.rollingTime_t * 1000);
        } else {
            this.properties.stopRolling[SPIN_MODE.NORMAL_MODE] = this.reckonRollingData(this.stopRollingInspect.customRollingTime_n);
            this.properties.stopRolling[SPIN_MODE.QUICK_MODE]  = this.reckonRollingData(this.stopRollingInspect.customRollingTime_q);
            this.properties.stopRolling[SPIN_MODE.TURBO_MODE]  = this.reckonRollingData(this.stopRollingInspect.customRollingTime_t);
        }
    }

    /**
     * @description 計算滾輪時間
     * @param sec 固定時間
     * @returns 
     */
    private unifyRollingTime ( sec:number ) {
        let wheels = this.getWheels();
        let rollingData = [];

        rollingData.push({ wheelID: 0, time: 0 });
        for(let i=1;i<wheels.length;i++) {
            rollingData.push({ wheelID: i, time: sec });
        }

        return rollingData;
    }

    /**
     * @description 計算滾輪時間
     * @param timeArr 自定義時間
     * @returns 
     */
    private reckonRollingData(timeArr:number[]) {
        let rollingData = [];
        for(let i=0;i<timeArr.length;i++) {
            rollingData.push({ wheelID: i, time: timeArr[i] });
        }
        
        let sortData = rollingData.sort((a, b) => { return a.time - b.time; });
        let startTime = sortData[0].time;

        for(let i=sortData.length-1;i>=1;i--) {
            let time = (sortData[i].time * 1000) - (sortData[i-1].time * 1000);
            sortData[i].time = time + startTime;
        }

        return sortData;
    }

    /**
     * @description 是否正在聽牌
     */
    protected get isNearMiss() : boolean { return this.properties.nearMiss >=0; }

    // 滾輪速度設定 Norma,Quick,Turbo SPIN_MODE
    public setSpinMode ( mode: SPIN_MODE ): SPIN_MODE { return this.properties.mode = mode; }
    public get spinMode() { return this.properties.mode; }

    /**
     * @description 取得滾輪速度設定
     * @deprecated 即將廢棄, 請使用 Reel.spinMode 取得 
     * @returns 
     */
    public getSpinMode (): SPIN_MODE { return this.spinMode; }
    // 滾輪速度設定

    //快速停輪 isFastStoping
    protected get isFastStoping():boolean { return this.properties.isFastStoping; }
    public set fastStoping(value:boolean) { this.properties.isFastStoping = value; }
    // 快速停輪

    //設定停輪事件 stopingHandler
    /** 設定停輪 Handler */
    public setStopingHandler(handler: EventHandler) { this.properties.handler.stoping = handler; }
    /** 移除停輪 Handler */
    public removeStopingHandler() {  this.properties.handler.stoping = null; }
    //設定停輪事件 stopingHandler

    //狀態 REEL_STATE
    public get state() { return this.properties.state; }
    private changeState ( state: REEL_STATE ) { this.properties.state = state; }

    //machine
    public get machine() { return this.properties.machine; }
    public setMachine(machine:any) { this.properties.machine = machine; }
    //machine

    //設定盤面結果 result 
    public get result() { return this.properties.result; }
    public setResult(result:any) { this.properties.result = result; }

    public get container() { return this.properties.container; }

    /**
     * @description 重置滾輪資料
     */
    public Rest() {
        let stopHandler = new EventTarget();
        this.properties.handler.stoping = stopHandler;
        this.properties.result = null;
        this.properties.nearMiss = -1;
        this.properties.isFastStoping = false;
        this.properties.stopingWheel = new Array(this.getWheels().length).fill(false);

        this.moveBackToWheel();
    }

    /**
     * @description 滾輪開始滾動
     */
    public async Spin() {
        this.Rest();

        this.changeState(REEL_STATE.SPINING_STATE); // 開始滾輪
        this.startRolling();      // 啟動滾輪

        await this.rolling();     // 滾輪持續滾動
        this.changeState(REEL_STATE.STOPING_STATE); // 停止滾輪

        await this.stopRolling(); // 通知停止滾輪
        this.changeState(REEL_STATE.NORMAL_STATE);  // 恢復正常狀態

        await Utils.delayEvent(this.properties.handler.stoping, 'done'); // 等待滾輪靜止
        this.machine?.eventSpingStop(0);            // 通知機台滾輪停止
    }

    /**
     * @description 啟動滾輪
     */
    protected async startRolling() {
        let mode = this.spinMode;
        let rollingData = this.properties.startRolling[mode];
        let wheels = this.getWheels();
        let time = 0;

        for(let i=0;i<rollingData.length;i++) {

            let time = rollingData[i].time;
            if ( !this.isFastStoping || time > 0 ) await Utils.delay(time);

            let data = rollingData[i];
            let wheel = wheels[data.wheelID];
            wheel.Spin();
        }
    }

    /**
     * @description 滾輪持續滾動
     */
    protected async rolling() {
        
        let stopTime = this.properties.rolling[this.spinMode];
        let stepTime = stopTime/5;
        let time = 0;

        while(true) {
            await Utils.delay(stepTime);
            if ( this.result === null ) continue;   // 等待盤面結果
            if ( this.isFastStoping )   break;      // 快速停輪
            if ( this.isNearMiss )      continue;   // 等待聽牌
            if ( time >= stopTime )     break;      // 滾輪停止時間

            time += stepTime;
            console.log('rolling time:', time, stopTime);
        }

        await Utils.delay(100);
    }

    /**
     * @description 通知 Wheel 停止滾輪
     */
    protected async stopRolling() {
        let mode = this.spinMode;
        let rollingData = this.properties.stopRolling[mode];
        let wheels = this.getWheels();
        let result = this.result;

        for(let i=0;i<rollingData.length;i++) {
            
            let time = rollingData[i].time;
            let data = rollingData[i];
            let id = data.wheelID;
            let wheel = wheels[id];
            if ( !this.isFastStoping || time > 0 ) {
                await Utils.delay(time);
            }

            wheel.stopRolling(result[id]);
        }
    }

    /**
     * 將表演的 Symbol 移回滾輪
     */
    public moveBackToWheel() {
        let wheels = this.getWheels();
        let showDropSymbols = this.properties.showDropSymbols;

        for(let i=0;i<wheels.length;i++) {
            let symbols = showDropSymbols[i];
            if ( symbols?.length === 0 ) continue;
            for(let j=0;j<symbols.length;j++) {
                let symbol = symbols[j];
                let position = symbol.worldPosition;
                symbol.parent = wheels[i].container;
                symbol.worldPosition = position;
            }

            showDropSymbols[i] = [];
        }

        this.properties.showDropSymbols = showDropSymbols;
    }
    
     /**
     * 移動到表演位置，並且進行表演
     * @param symbol 
     */
    public moveToShowDropSymbol(wheelID:number, symbol:Node) {
        let container = this.symbolInspect.container;
        let position = symbol.worldPosition;
        symbol.parent = container;
        symbol.worldPosition = position;
        symbol?.drop();

        this.properties.showDropSymbols[wheelID].push(symbol);
    }

    /**
     * 停輪時，檢查是否有破框與表演的 Symbol
     * @param wheelID 
     * @returns 
     */
    public showDropSymbol(wheelID:number) {
        let dropSymbols = this.symbolInspect.isDropSymbol;
        let wheelSymbols = this.getWheels()[wheelID].symbols();

        if ( dropSymbols?.length === 0 ) return;
        wheelSymbols.forEach(symbol => {
            let symbolComponent = symbol.getComponent(Symbol);
            if (dropSymbols.includes(symbolComponent.symID)) {
                this.moveToShowDropSymbol(wheelID, symbol);
            }
        });
    }

    /**
     * 從 wheel 通知，完全停止滾輪
     * @param wheelID 
     */
    public setStopWheel(wheelID:number) {
        this.properties.stopingWheel[wheelID] = true; // 設定滾輪停止
        this.showDropSymbol(wheelID);                 // 檢查是否有破框與表演的 Symbol
        let self = this;
        if ( this.properties.stopingWheel.every((value) => value === true) ) {
            self.properties.handler.stoping.emit('done'); 
        }
    }

    /**
     * 取得 Symbol Node 隱藏中的 Symbol 不列入內
     * @returns Node[][]
     */
    public get symbols (): Node[][] { return this.getWheels().map(wheel => wheel.getWheelSymbol); }

    /**
     * 取得 Symbol ID
     * @returns { json } { wheelID:{ index:symbolID, index2:symbolID... }, wheelID2:{ index:symbolID, ... }, ...
     */
    public get symbolsID () { return this.getWheels().reduce((symbols, wheel, idx) => { symbols[idx] = wheel.getSymbolIdxIDs; return symbols;}, {}); }

    /**
     * 取得盤面位置資料，包含隱藏中的 Symbol
     */
    public get getSymbolIdxData () { return this.getWheels().reduce((data, wheel, i) => { data[i] = wheel.getIndexSymbol; return data; }, {}); }

    /**
     * 取得 Symbol Node
     * @param id 指定 Symbol ID
     * @returns 
     */
    public getSymbolFromID (id): Symbol[] { return this.symbols.flatMap(symbolRow => Object.values(symbolRow).filter(symbol => symbol.id === id)); }
}

