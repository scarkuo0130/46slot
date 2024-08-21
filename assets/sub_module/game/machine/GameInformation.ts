import { _decorator, Component, instantiate, Label, PageView, ScrollView, Node, Button, UITransform } from 'cc';
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
        this.infinityPageView();
    }

    protected start() {
        let pageView = this.properties['ui']['PageView'].component;
        let children = pageView.indicator.node.children;
        if ( children == null || children.length === 0 ) return;
        children[0].active = false;
        children[children.length-1].active = false;
    }

    private copyPageToScrollView() {
        let pageContent = this.properties['ui']['pageContent'].node;
        let scrollContent = this.properties['ui']['scrollContent'].node;

        pageContent.children.forEach((node)=>{
            let newNode : Node = instantiate(node);
            let uiTransform = newNode.getComponent(UITransform);
            let size = uiTransform.contentSize;
            uiTransform.setContentSize(size.width*0.8, size.height*0.8);
            newNode.setScale(0.75,0.75,1);
            scrollContent.addChild(newNode);
        });
    }

    private infinityPageView() {
        const pageContent = this.properties['ui']['pageContent'].node;
        const children = pageContent.children;
        // 複製第一頁到最後一頁
        const firstPage = children[0];
        const lastPage = children[children.length-1];
        const newPage = instantiate(firstPage);
        const newlastPage = instantiate(lastPage);
        pageContent.addChild(newPage);
        pageContent.addChild(newlastPage);
        newlastPage.setSiblingIndex(0);

        // 設定事件
        let pageView = this.properties['ui']['PageView'].component;
        pageView.node.on(PageView.EventType.PAGE_TURNING, this.onPageEvent, this);
    }

    public onPageEvent(pageView:PageView, args) {
        const curPageIdx = pageView.curPageIdx;
        const length = pageView.content.children.length;
        if ( curPageIdx === 0 ) {
            pageView.scrollToPage(length - 2, 0.01);
        } else if ( curPageIdx === length - 1 ) {
            pageView.scrollToPage(1, 0.01);
        }
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

    public displayNumber(value:number) : string{
        return Utils.changeUnit(value, true); 
    }

    // 取得 paytable 的 label
    public paytableLabelString(symbol:number) {
        if ( SymbolPayTable[symbol] == null ) return '';
        let totalBet = this.machine.totalBet;
        let paytable = SymbolPayTable[symbol];
        let value = [ this.displayNumber(totalBet*paytable[3]),this.displayNumber(totalBet*paytable[4]),this.displayNumber(totalBet*paytable[5]) ];
        let str = `3  ${value[0]}\n`
                + `4  ${value[1]}\n`
                + `5  ${value[2]}`;

        return str;
    }
    
    public paytableSymbolLabel(label:Label, symbol:number) { label.string = this.paytableLabelString(symbol); }

    public static OpenUI() { GameInformation.Instance.openUI(); }
    public openUI() {
        this.machine.controller.maskActive(true);
        this.changePaytableSymbol();
        Utils.commonActiveUITween(this.node, true);

        this.properties['ui']['PageView'].component.scrollToPage(1, 0.1);
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

