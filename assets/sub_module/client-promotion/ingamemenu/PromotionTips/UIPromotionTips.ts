import { _decorator, Component, Node, Label, Button, Toggle, Sprite, EventTarget,sys } from 'cc';
import { Utils, DATA_TYPE }         from '../../../utils/Utils';
import { Machine } from '../../../game/machine/Machine';
const { ccclass, property } = _decorator;

interface PromotionData {
    promotion_type: number;
    promotion_id: string;
    promotion_name: string;
    min_bet: number;
    time_zone: string;
    begin_date: string;
    end_date: string;
    currency: string;
    budget: number;
}

@ccclass('UIPromotionTips')
export class UIPromotionTips extends Component {
    public static Instance: UIPromotionTips = null;

    protected onloadData = {
        'content' : {
            'node' : { [DATA_TYPE.TYPE] : Node, [DATA_TYPE.NODE_PATH] : 'Content' },
            'title' : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Content/Title' },
            'name'  : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Content/Name' },
            'time' : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Content/Time' },
            'reward' : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Content/Reward/value' },
            'date' : { [DATA_TYPE.TYPE] : Label, [DATA_TYPE.NODE_PATH] : 'Content/Date/value' },
            'mask' : { [DATA_TYPE.TYPE] : Sprite, [DATA_TYPE.NODE_PATH] : 'Mask' },
        },

        'buttons' : {
            'confirm' : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.NODE_PATH] : 'Content/Confirm',[DATA_TYPE.CLICK_EVENT]: this.clickConfirm},
            'toggle' : { [DATA_TYPE.TYPE] : Toggle, [DATA_TYPE.NODE_PATH] : 'Content/Toggle/Toggle',[DATA_TYPE.CLICK_EVENT]: this.clickToggle },
        },
    };

    private properties = {
        'lastData': null,
        'openEvent': null,
    };

    private promotionData: PromotionData[] = [];

    onLoad() {
        this.node.setPosition(0, 0, 0);
        UIPromotionTips.Instance = this;
        Utils.initData(this.onloadData, this);
        this.node.active = false;
    }

    public async closeUI() {
        Utils.commonFadeIn(this.node, true);
        await Utils.commonActiveUITween(this.properties['content']['node'].node, false);
        this.node.active = false;
        this.properties['openEvent'].emit('done');
    }

    public static async DisplayPromotion(data: PromotionData[]|any[]) {
        if ( data == null || data.length == 0 ) return;
        if ( UIPromotionTips.Instance == null ) return;

        const instance = UIPromotionTips.Instance;
        instance.promotionData = data;
        
        while(Machine.Instance.isBusy) await Utils.delay(100); // 等待 machine 忙完...
        for(let i=0;i<data.length;i++) await instance.openUI(i);
    }

    public async openUI(idx:number=0) {
        if ( this.promotionData == null || this.promotionData.length == 0 ) return;

        const data = this.promotionData[idx];
        if ( this.displayContent(data) == false ) return;
        this.properties['openEvent'] = new EventTarget();
        this.node.active = true;
        
        Utils.commonFadeIn(this.node, false);
        this.rollingReward();
        await Utils.commonActiveUITween(this.properties['content']['node'].node, true, true, 1);
        this.keepDisplayTimeMessage();

        await Utils.delayEvent(this.properties['openEvent']);
    }

    private promotionTypeTitle = { 0 : 'Cash Drop', 1: 'Tournament', 2: 'Jackpot' };
    public displayContent(data: PromotionData | any ) {
        if (data == null) return false;
        if ( data.budget == null || data.budget === 0 ) return false;

        /// 檢查時間有沒有過期
        const now = new Date().getTime();
        const end_date = new Date(data.end_date);
        if ( now > end_date.getTime() ) return false;

        // 檢查時間有沒有在開始時間之前
        const begin_date = new Date(data.begin_date);
        if ( now < begin_date.getTime() ) return false;

        // 活動類別
        const typeName = this.promotionTypeTitle[data.promotion_type];
        if ( typeName == null ) return false;

        // 今日顯示設定
        if ( this.getStorageToday(data.promotion_id) === true ) return false;

        // 時間顯示，只顯示日期 yyyy-mm-dd
        const beginDate = data.begin_date.split(' ')[0];
        const endDate = data.end_date.split(' ')[0];
        const reward = Utils.numberComma(data.budget/2);

        this.properties['content']['title'].component.string = typeName;
        this.properties['content']['name'].component.string = data.promotion_name;
        this.properties['content']['reward'].component.string = `${reward} ${data.currency}`;
        this.properties['content']['date'].component.string = `${beginDate} ~ ${endDate}`;
        this.properties.lastData = data;
        this.properties['content']['time'].component.string = this.getTimeMessage();
        return true;
    }

    public async rollingReward() {
        const rewardLabel = this.properties['content']['reward'].component;
        const rewardScore = this.properties.lastData.budget;
        const rewardCurrency = this.properties.lastData.currency;

        await Utils.commonTweenNumber(rewardLabel, rewardScore/2, rewardScore, 1, (value:number) => {
            return `${Utils.numberComma(value)} ${rewardCurrency}`;
        });
    }

    // 持續顯示秒數
    public async keepDisplayTimeMessage() {
        if ( this.node.active == false ) return;
        this.properties['content']['time'].component.string = this.getTimeMessage();;
        await Utils.delay(1000);
        this.keepDisplayTimeMessage();
    }

    // 取得時間訊息
    public getTimeMessage() {
        if ( this.properties.lastData == null ) return '00d:00h:00m:00s';

        const now = new Date().getTime();
        const end_date = new Date(this.properties.lastData.end_date).getTime();
        if ( now > end_date ) return '00d:00h:00m:00s';

        let sec = Math.floor((end_date - now) / 1000);
        let day = Math.floor(sec / 86400);
        sec -= day * 86400;
        let hour = Math.floor(sec / 3600);
        sec -= hour * 3600;
        let min = Math.floor(sec / 60);
        sec -= min * 60;

        return `${day}d:${hour}h:${min}m:${sec}s`;
    }

    public clickConfirm() { 
        this.closeUI(); 
        if ( this.properties['buttons']['toggle'].component.isChecked === false ) return;
        this.saveStorageToday(this.properties.lastData.promotion_id);
    }

    public saveStorageToday(id:string) {
        const today = this.formatDateToYYYYMMDD(Date.now());
        sys.localStorage.setItem(id, today);
        console.log('saveStorageToday', id, today);
    }

    public getStorageToday(id:string) : boolean {
        return sys.localStorage.getItem(id) === this.formatDateToYYYYMMDD(Date.now());
    }

    public clickToggle() {}

    public formatDateToYYYYMMDD(timestamp: number): string {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份從 0 開始，所以需要加 1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

}

