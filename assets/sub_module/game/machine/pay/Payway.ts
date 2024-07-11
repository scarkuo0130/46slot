import { _decorator, Component, Node, tween, Vec3 } from 'cc';
import { Paytable } from './PayTable';
import { Utils } from '../../../utils/Utils';
import { Symbol } from '../Symbol';
import { Machine } from '../Machine';
const { ccclass, property } = _decorator;

@ccclass('Payway')
export class Payway extends Paytable {

    protected onload() { return; }

    // 給予專案 start 使用
    protected onstart() { return; }

    /**
     * 進入報獎流程
     * @override 可覆寫
     * @todo 如果有中獎的話, 進入報獎流程
     * @todo 報獎完畢後，如果分數高於 BigWin 分數，進入 BigWin 流程
     * @todo 如果玩家沒有中斷報獎流程，則進入輪播報獎流程
     */
    public async processWinningScore() {
        const gameResult = this.gameResult;
        const { pay_credit_total } = gameResult;

        this.reel.closeNearMissMask();  // 關閉 NearMiss 遮罩
        if ( pay_credit_total === 0 ) return;
        
        await super.processWinningScore();
        await super.processBigWin(pay_credit_total);
    }

    /**
     * 播放全部獎項
     */
    public async performAllPayline() {
        const { lines, pay_credit_total } = this.gameResult;
        const totalWinLabel = this.totalWinLabel;

        await this.reelMaskActive(true);        // 打開遮罩

        // 播放全部獎項
        let max_wait_sec = 0;
        for(let i = 0; i < lines.length; i++) {
            let way = lines[i];
            let sec = await this.performSingleLine(way);
            if ( sec > max_wait_sec ) max_wait_sec = sec;
        }
        
        Utils.commonTweenNumber(totalWinLabel, 0, pay_credit_total, (max_wait_sec/2) ); // 播放總得分
        const waitSec = max_wait_sec * 1000;
        await Utils.delay(waitSec); 

        this.reel.moveBackToWheel();            // 將所有 Symbol 移回輪中
        totalWinLabel.string = '';              // 關閉總得分

        if ( this.machine.featureGame === true ) {
            this.controller.addTotalWin(pay_credit_total);    // 增加總得分
        } else {
            this.controller.changeTotalWin(pay_credit_total); // 更新總得分
            this.controller.refreshBalance();                 // 更新餘額
        }
    }

    // way {"symbol_id": 7,"way": 3,"ways": [1,1,1],"pay_credit": 500}
    public async performSingleLine(lineData: any, isWaiting: boolean=false) : Promise<number> {
        const { symbol_id, way, pay_credit } = lineData;
        
        let reel = this.reel;
        let wSymbols = [];
        for(let i=0;i<way.length;i++) {
            wSymbols.push(reel.moveToShowWinContainer(i, [symbol_id, 0], way[i]));
        }
        // console.log('wSymbols', wSymbols,[symbol_id, way, pay_credit]);
        let winSec = wSymbols[0][0].getComponent(Symbol).getAnimationDuration();
        if ( winSec < 1 ) winSec = 1;
        wSymbols.forEach( w=>w.forEach( symbol=> symbol.getComponent(Symbol).win()));
        
        if ( isWaiting ) {
            this.displaySingleWinNumber(pay_credit, wSymbols[0][0].worldPosition);
            await Utils.delay(winSec * 1000);
            this.displaySingleWinNumber(0);
        }
        return winSec;
    }

    /**
     * 單獎輪播
     */
    public async performSingleLineLoop() {
        const { lines, pay_credit_total } = this.gameResult;

        if ( pay_credit_total === 0 ) return;

        await this.reelMaskActive(true);        // 打開遮罩
        let idx = 0;
        while(true) {
            await this.performSingleLine(lines[idx], true);
            if ( this.machine.state !== Machine.SPIN_STATE.IDLE ) return;
            this.reel.moveBackToWheel();        // 將所有 Symbol 移回輪中
            idx++;
            if ( idx >= lines.length ) idx = 0;
        }
    }
}

