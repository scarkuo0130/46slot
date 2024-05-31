import { _decorator, Component, EventHandler, Label, Node, tween } from 'cc';
import { Machine, MACHINE_STATE, MACHINE_STATUS } from '../Machine';
import { SPIN_ACTION } from '../Controller';
import { Utils, _utilsDecorator } from '../../../utils/Utils';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('FeatureGame')
@disallowMultiple(true)
@menu('SlotMachine/Machine/FeatureGame')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.k2l8nx4kfjxe')
export class FeatureGame extends Component {

    @property({ type: Node, displayName: 'EnterFeatureGameUI', tooltip: '進入 FeatureGame 的介紹UI', group: { name: 'FeatureGameSetting' } })
    public enterFeatureGameUI: Node;

    @property({ type: Node, displayName: 'EndFeatureGameUI', tooltip: '結束 FeatureGame UI', group: { name: 'FeatureGameSetting' } })
    public endFeatureGameUINode: Node;

    @property({ type: Label, displayName: 'EndFeatureGameTotalWin', tooltip: 'FeatureGameUI 總分顯示', group: { name: 'FeatureGameSetting' } })
    public endFeatureGameTotalWin: Label;
    protected machine: Machine = null;
    public setMachine(machine: Machine) { this.machine = machine; }
    public get getMachine() { return this.machine; }

    protected perfromPaytableCallback: EventHandler;

    protected onLoad() {
        if (this.enterFeatureGameUI) {
            this.enterFeatureGameUI.active = false;
            this.enterFeatureGameUI.on(Node.EventType.TOUCH_END, this.startFeatureGame, this);
        }

        this.perfromPaytableCallback = new EventHandler();
        this.perfromPaytableCallback.target = this.node;
        this.perfromPaytableCallback.component = 'FeatureGame';
        this.perfromPaytableCallback.handler = 'perfromPaytableEvent';
        this.perfromPaytableCallback.customEventData = null;
    }

    /**
     * 判斷是否要進入 FreatureGame
     * @param result 盤面結果
     * @returns 是否要進入 feature game
     */
    public isFeatureGame(result: any): boolean { return false; }

    /**
     * 轉場動畫
     * 在 FeatureGame 的開場介面的 Button 點擊指到這個 function
     * 請在專案資料夾下的 FeatureGame 腳本撰寫轉場動畫
     */
    public async preStartFeature() {
        this.enterFeatureGameUI.active = false;
        return;
    }

    /**
     * 進入 FeatureGame 需要執行的動畫
     */
    public async enterFeatureGame() {
        this.machine.controller.spinButtonController(SPIN_ACTION.SPECIAL);
        this.machine.setStatus = MACHINE_STATUS.FREE_GAME;
        if (this.enterFeatureGameUI == null) return;
        this.enterFeatureGameUI.active = true;
    }

    /**
     * 開始進行 FeatureGame
     */
    public async startFeatureGame() { }

    /**
     * machine 回傳的停輪事件
     * @param wheelIndex 
     * @returns 
     */
    public async eventSpingStop(wheelIndex: number) { return false; }

    public async perfromPaytableEvent() { return; }

    protected tweenTotalWin = null;
    protected tmp_totalWin = 0;
    protected isReturnMainGame = false;
    public async EndFeatureGame(totalWin) {
        this.endFeatureGameUINode.active = true;
        this.tmp_totalWin = totalWin;
        let tweenValue = { 'value': 0 };
        let self = this;
        this.tweenTotalWin = tween(tweenValue).to(5, { value: totalWin }, {
            onUpdate: (x) => {
                let value = Math.floor(tweenValue.value);
                self.endFeatureGameTotalWin.string = Utils.numberComma(value);
            }
        }).start();
    }

    public async returnMainGame() {
        if (this.isReturnMainGame === true) return;
        if (this.tweenTotalWin != null) this.tweenTotalWin.stop();
        this.isReturnMainGame = true;
        this.endFeatureGameTotalWin.string = Utils.numberComma(this.tmp_totalWin);
        let totalWin = this.tmp_totalWin;
        await Utils.delay(1000);
        this.isReturnMainGame = false;
        this.tmp_totalWin = 0;
        this.endFeatureGameUINode.active = false;
        this.machine.setStatus = MACHINE_STATUS.MAIN_GAME;
        this.machine.setState = MACHINE_STATE.IDLE;
        this.machine.controller.spinButtonController(SPIN_ACTION.NORMAL);
    }
}

