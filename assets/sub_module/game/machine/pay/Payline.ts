import { _decorator, tween, Component, Node, sp, Label, Vec3, EventHandler, Tween } from 'cc';
import { Machine } from '../Machine';
import { Reel } from '../Reel_bak';
import { Paytable, PAYTABLE_TYPE } from './PayTable';
import { Utils } from '../../../utils/Utils';
import { ObjectPool } from '../../ObjectPool';
import { Symbol } from '../Symbol';
import { SimbpleAudioClipData, SoundManager } from '../SoundManager';
import { gameInformation } from '../../GameInformation';
const { ccclass, property } = _decorator;

@ccclass('Payline')
export class Payline extends Paytable {

    @property({type:[Node], displayName:'PayLineNodes', tooltip:'得獎線物件', group:{name:'Nodes', id:'1'},})
    public paylineNodes : Node[] = [];

    @property({type:Node, displayName:'PaylineContainer', tooltip:'得獎線物件', group:{name:'Container', id:'1'}})
    public paylineContainer : Node;

    @property({ displayName:'DisplayTime', tooltip:'全獎播放時間(毫秒)', max:10000, min:100, step:100 })
    public showAllLineSec = 1000;

    @property({type:SimbpleAudioClipData, displayName:'PaylineAudio', tooltip:'賠付線跑線音'})
    public paylineAudio : SimbpleAudioClipData = new SimbpleAudioClipData();

    protected override paytableType = PAYTABLE_TYPE.PAYLINE;

    public payLines = [];

    /** 賠付線盤面 */
    public payLineData = [ ];
    
    /**
     * 顯示中獎效果
     * @from machine
     * @param payRuleData example
     * "pay_line": [ 
     *      {"pay_line": 2,"symbol_id": 7,"amount": 3,"pay_credit": 400},
     *      {"pay_line": 7,"symbol_id": 7,"amount": 4,"pay_credit": 1600},
     * ],
     */

    protected performAllLineTween;
    
    onLoad() {
        super.onLoad();
        this.initPayline();
    }

    /**
     * 預先準備 payline
     */
    public initPayline() {
        if ( this.paylineContainer != null ) {
            this.payLines = [];
            let children = this.paylineContainer.children;
            for(let i in children) {
                this.payLines.push(children[i]);
            }
        } else {
            if ( this.paylineNodes == null || this.paylineNodes.length == 0 ) {
                console.error('PayRule.ts: 沒有配置顯示線的物件');
                return;
            }

            this.payLines = [];
            for(let i in this.paylineNodes) {
                this.payLines.push(this.paylineNodes[i]);
            }
        }

        this.closePayline();
        this.node.active = false;
    }

    /**
     * 中獎表演
     * @param payRuleData 中獎資料
     * @param totalwin    中獎總贏分
     * @todo 把所有線都播放出來
     * @returns 
     */
    public async performAllLine(payRuleData, totalwin, firstTime=false) {
        if ( payRuleData == null ) return;
        if ( payRuleData.length == 0 ) return;
        
        this.reelMaskActive(true);
        let pay_line = payRuleData['pay_line'];

        for (let i = 0;i<pay_line.length;i++) {
            this.performSingleLine(pay_line[i], true);
        }

        let winData = { 'number': Math.floor(totalwin/2) };
        let rollNumberSec = (this.showAllLineSec-200)/1000;
        let self = this;
        // let currency = gameInformation._currencySymbol;
        SoundManager.playSoundData(this.paylineAudio);
        
        if ( firstTime ) this.performAllLineTween = tween(winData).to(rollNumberSec,{number: totalwin}, {
            easing:"linear",
            onUpdate: (target)=>{ 
                self.winNumberAllLine.string = 'WIN' + Utils.numberComma(target['number']); 
            },
        }).start();

        let showSec = this.showAllLineSec;
        await Utils.delay(showSec);

        super.closePayline();
    }

    showSymbols = [];
    visableSymbols = [];
    public async performSingleLine(lineData, isAllLine:boolean) {
        if ( this.tempCancelPerform === true ) return;
        if ( lineData == null ) return;

        let lineIdx       = lineData['pay_line'];
        let winScore      = lineData['pay_credit'];
        let symboleAmount = lineData['amount'];
        let paylineData   = this.payLineData[lineIdx];
        let symbols       = this.machine.reel.getSymbolIdxData;

        /// 顯示 symbol
        for(let x=0;x<symboleAmount;x++) {
            let y      = paylineData[x];
            let symbol = symbols[x][y];
            let id     = symbol.getComponent<Symbol>(Symbol).symID;
            this.visableSymbols.push(symbol);

            let showSymbol : Node = ObjectPool.Get(id+'');
            this.paylineContainer.addChild(showSymbol);
            showSymbol.setWorldPosition(symbol.getWorldPosition());
            showSymbol.active = true;
            symbol.active = false;
            showSymbol.getComponent(Symbol).winState();
            showSymbol.getComponent(Symbol).machine = this.machine;
            this.showSymbols.push(showSymbol);
        }

        /// 顯示線
        this.payLines[lineIdx].active = true;
        let lineSpine: sp.Skeleton =  this.payLines[lineIdx].getComponent(sp.Skeleton);
        lineSpine.loop = false;
        lineSpine.animation = lineSpine.animation;
        lineSpine.paused = false;
        
        if ( isAllLine == false ) SoundManager.playSoundData(this.paylineAudio);

        /// 單線贏分
        if ( isAllLine == false ) {
            this.reelMaskActive(true);
            this.singleLineActive(true, Utils.numberComma(winScore));
            let worldPos = this.showSymbols[0].getWorldPosition();
            worldPos.x += this.winNumberSinglePos.x;
            worldPos.y += this.winNumberSinglePos.y;

            this.winNumberSingleLine.node.setWorldPosition(worldPos);
        }

        let showSec = this.showAllLineSec;
        //if ( await Utils.waittingDelay('performSingleLine', showSec) === false ) return;
        await Utils.delay(showSec);
        lineSpine.paused = true;
        this.reelMaskActive(false);

        this.cleanSymbol();
        // await Utils.delay(200);
    }

    protected cleanSymbol() {
        this.singleLineActive(false);
        for(let i in this.visableSymbols) this.visableSymbols[i].active = true;
        for(let i in this.showSymbols) {
            let symbol:Node = this.showSymbols[i];
            symbol.active = false;
            let symbolID = symbol.getComponent<Symbol>(Symbol).symID;
            ObjectPool.Put(symbolID, symbol);
        }

        this.visableSymbols = [];
        this.showSymbols = [];
    }

    public cancelPerform() {
        this.setPerformAllLineValue(null);
        this.cleanSymbol();
        Tween.stopAllByTarget(this.node);
        super.cancelPerform();
    }

    protected closePayline() {
        for(let i=0;i<this.payLines.length;i++) {
            if ( this.payLines[i] == null ) continue;
            this.payLines[i].active = false;
        }
        return super.closePayline();
    }
}

