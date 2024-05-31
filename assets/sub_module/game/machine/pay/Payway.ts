import { _decorator, Component, Node, tween } from 'cc';
import { Paytable } from './PayTable';
import { Utils } from '../../../utils/Utils';
import { Symbol } from '../Symbol';
import { SimbpleAudioClipData, SoundManager } from '../SoundManager';
const { ccclass, property } = _decorator;

@ccclass('Payway')
export class Payway extends Paytable {
    @property({ displayName: 'PerformAllWaysSec(millisecond)', tooltip: '全部得獎播放時間(微秒)', group: { name: 'Payway', id: '0' } })
    performAllWaysSec = 2000;

    @property({ type: SimbpleAudioClipData, displayName: 'PaylineAudio', tooltip: '賠付線跑線音' })
    public paylineAudio: SimbpleAudioClipData = new SimbpleAudioClipData();

    protected performAllLineTween;
    protected performSymbols: Symbol[] = [];
    protected wayIndex = 0;

    protected tempPaywayData;

    public async performAllLine(payRuleData, totalwin: number, firstTime = false) {
        console.log(payRuleData);
        if (payRuleData['extra'] == null) return;
        if (payRuleData['extra']['ways'] == null) return;
        this.tempPaywayData = payRuleData;
        let ways = payRuleData['extra']['ways'];

        this.wayIndex = 0;
        this.performSymbols = [];
        for (let i in ways) {
            this.performOneWay(ways[i], true);
        }

        let winData = { 'number': Math.floor(totalwin / 2) };
        let rollNumberSec = (this.performAllWaysSec - 200) / 1000;
        let self = this;
        // let currency = gameInformation._currencySymbol;
        SoundManager.playSoundData(this.paylineAudio);

        if (firstTime) this.performAllLineTween = tween(winData).to(rollNumberSec, { number: totalwin }, {
            easing: "linear",
            onUpdate: (target) => {
                self.winNumberAllLine.string = 'WIN' + Utils.numberComma(target['number']);
            },
        }).start();

        await Utils.delay(this.performAllWaysSec);
        this.closePayline();
    }

    /**
     * 
     * @param waysData {
            "symbol_id": 6,
            "way": 4,
            "ways": [
                1,
                1,
                1,
                1
            ],
            "pay_credit": 2
        }
     */
    public performOneWay(waysData, isAllLine: boolean = false) {
        console.log(waysData);
        let symbol_id = waysData['symbol_id'];
        let symbols = this.machine.reel.getSymbolFromID(symbol_id);
        symbols.forEach(sym => { sym.winState(); });
        this.performSymbols = this.performSymbols.concat(symbols);

        if (isAllLine === true) return;
        let winScore = waysData['pay_credit'];
        this.reelMaskActive(true);
        this.singleLineActive(true, Utils.numberComma(winScore));
        let worldPos = symbols[0].node.getWorldPosition();
        worldPos.x += this.winNumberSinglePos.x;
        worldPos.y += this.winNumberSinglePos.y;

        this.winNumberSingleLine.node.setWorldPosition(worldPos);
    }

    protected async closePayline() {
        console.log(this.performSymbols);
        for (let i in this.performSymbols) {
            let symbol: Symbol = this.performSymbols[i];
            if (symbol == null) continue;
            symbol.normalState();
        }

        this.performSymbols = [];
        await Utils.delay(500);
        return super.closePayline();
    }

    public async performSingleLineLoop() {
        if (this.tempCancelPerform === true) {
            return this.closePayline();
        }

        let ways = this.tempPaywayData['extra']['ways'];
        this.wayIndex++;

        if (this.wayIndex === ways.length) {
            this.wayIndex = 0;
        }

        await this.performOneWay(ways[this.wayIndex], false);
        await Utils.delay(this.performAllWaysSec);

        this.closePayline();
        if (this.tempCancelPerform) return;

        return this.performSingleLineLoop();
    }
}

