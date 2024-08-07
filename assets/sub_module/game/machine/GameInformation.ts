import { _decorator, Component, instantiate, Label, PageView, ScrollView, Node, Button } from 'cc';
import { Machine } from './Machine';
import { DATA_TYPE, Utils } from '../../utils/Utils';
const { ccclass, property } = _decorator;


export var SymbolPayTable = {
    1: {  3: 1,     4: 3,    5: 15 },
    2: {  3: 0.5,   4: 1.5,  5: 7.5 },
    3: {  3: 0.4,   4: 1.25, 5: 6 },
    4: {  3: 0.3,   4: 0.75, 5: 3.75 },
    5: {  3: 0.1,   4: 0.3,  5: 1.5 },
    6: {  3: 0.05,  4: 0.15, 5: 0.75 },
    7: {  3: 0.05,  4: 0.15, 5: 0.75 },
    8: {  3: 0.05,  4: 0.15, 5: 0.75 },
    9: {  3: 0.05,  4: 0.15, 5: 0.75 },
    10: { 3: 0.05,  4: 0.15, 5: 0.75 },
    11: { 3: 0.05,  4: 0.15, 5: 0.75 },
    12: { 3: 0.25,  4: 0.5,  5: 2.5 },
};

@ccclass('gameInfomation')
export class GameInformation extends Component {

    public onload = {
        'ui' : {
            'PageView'      : {[DATA_TYPE.TYPE]: PageView,      [DATA_TYPE.NODE_PATH]: 'PageView'},
            'ScrollView'    : {[DATA_TYPE.TYPE]: ScrollView,    [DATA_TYPE.NODE_PATH]: 'ScrollView'},
            'pageContent'   : {[DATA_TYPE.TYPE]: Node,          [DATA_TYPE.NODE_PATH]: 'PageView/view/content'},
            'scrollContent' : {[DATA_TYPE.TYPE]: Node,          [DATA_TYPE.NODE_PATH]: 'ScrollView/view/content'},
            'closeButton'   : {[DATA_TYPE.TYPE]: Button,        [DATA_TYPE.NODE_PATH]: 'Close'},
        }
    };

    public properties = {};

    private get machine() { return Machine.Instance; }

    public static Instance: GameInformation = null;

    protected onLoad(): void {
        GameInformation.Instance = this;
        this.node.setPosition(0, 0, 0);
        this.node.active = false;
        Utils.initData(this.onload, this);
        // console.log(this);
        this.copyPageToScrollView();
    }

    private copyPageToScrollView() {
        let pageContent = this.properties['ui']['pageContent'].node;
        let scrollContent = this.properties['ui']['scrollContent'].node;

        pageContent.children.forEach((node)=>{
            let newNode : Node = instantiate(node);
            newNode.setScale(0.75,0.75,1);
            scrollContent.addChild(newNode);
        });
    }


    // 紀錄 paytable 的 label
    public paytableSymbols = {};

    // 加入 paytable 的 label
    public addPaytableSymbol(label:Label, symbol:number) { 
        if ( this.paytableSymbols[symbol] == null ) this.paytableSymbols[symbol] = [];
        if ( this.paytableSymbols[symbol].includes(label) === true ) return;
        this.paytableSymbols[symbol].push(label);
        this.paytableSymbolLabel(label, symbol);
    }

    public onStartAddPaytableSymbol(node, customEventData) {
        if ( node == null ) return;
        let label = node.getComponent(Label);

        if ( label == null ) return;

        let symbol = parseInt(customEventData);
        this.addPaytableSymbol(label, symbol);
    }

    // 改變 paytable 的 label
    public changePaytableSymbol() {
        for(let symbol in this.paytableSymbols) {
            this.paytableSymbols[symbol].forEach((label:Label)=> { this.paytableSymbolLabel(label, parseInt(symbol)); });
        }
    }

    // 取得 paytable 的 label
    public paytableLabelString(symbol:number) {
        if ( SymbolPayTable[symbol] == null ) return '';
        let totalBet = this.machine.totalBet;
        let paytable = SymbolPayTable[symbol];
        let str = `3 ${totalBet*paytable[3]}\n`
                + `4 ${totalBet*paytable[4]}\n`
                + `5 ${totalBet*paytable[5]}`;

        return str;
    }
    
    public paytableSymbolLabel(label:Label, symbol:number) { label.string = this.paytableLabelString(symbol); }

    public static OpenUI() { GameInformation.Instance.openUI(); }
    public openUI() {
        this.machine.controller.maskActive(true);
        this.changePaytableSymbol();
        Utils.commonActiveUITween(this.node, true);

        this.properties['ui']['PageView'].component.scrollToPage(0, 0);
        this.properties['ui']['ScrollView'].component.scrollToTop(0);
    }

    public closeUI() {
        this.machine.controller.maskActive(false);
        Utils.commonActiveUITween(this.node, false);
    }

    public addVerisonLabel(node:Node) {
        const label = node.getComponent(Label);
        if ( label == null ) return;

        const version = Utils.getVersion();
        label.string = `Version ${version}`;
    }
}

