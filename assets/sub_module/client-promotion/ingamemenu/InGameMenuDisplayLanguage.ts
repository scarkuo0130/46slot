import { _decorator } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 類別,參照InGameMenuContent做法, 顯示多國語系文字
 */
@ccclass( 'InGameMenuDisplayLanguage' )
export class InGameMenuDisplayLanguage {
    //protected value
    private static _instance: InGameMenuDisplayLanguage;

    protected totalBetMessage: string;
    protected promotionNotification: string;
    protected jackpotNotification: string;
    protected myJackpotNotification: string;

    public static get instance () {
        if ( this._instance ) {
            return this._instance;
        }

        this._instance = new InGameMenuDisplayLanguage();
        return this._instance;
    }
    /**
     * 設定Promotion和Jackpot使用的多國語系文字,由google翻譯,由於只有3句,所以取代i18n和L10n
     * @param currentLanguage ex:'en' , 'id'
     */
    setDisplayLanguage ( currentLanguage: string ) {
        let totalBetMessage = {
            'en': 'Qualifying promo bet amount must be higher than ${minBet}',
            'zh-cn': '合格的促销投注金额必须高于 ${minBet}',
            'ko': '적격 프로모션 베팅 금액은 ${minBet} 보다 높아야 합니다',
            'id': 'Jumlah taruhan promo yang memenuhi syarat harus lebih tinggi dari ${minBet}',
            'vi': 'Số tiền đặt cược khuyến mãi đủ điều kiện phải cao hơn ${minBet}',
            'th': 'จำนวนเงินเดิมพันโปรโมชั่นที่มีคุณสมบัติจะต้องสูงกว่า ${minBet}',
            'ms': 'Amaun pertaruhan promosi yang layak mestilah lebih tinggi daripada ${minBet}',
            'ph': 'Ang halaga ng qualifying promo bet ay dapat na mas mataas sa ${minBet}',
        };

        let promotionNotification = {
            'en': 'Congratulation, You Won ${currency} ${prize}',
            'zh-cn': '恭喜，您赢得了 ${currency} ${prize}',
            'ko': '축하합니다. ${currency} ${prize}에 당첨되셨습니다',
            'id': 'Selamat, Anda Memenangkan ${currency} ${prize}',
            'vi': 'Xin chúc mừng, bạn đã giành được ${currency} ${prize}',
            'th': 'ยินดีด้วย คุณได้รับ ${currency} ${prize}',
            'ms': 'Tahniah, Anda Memenangi ${currency} ${prize}',
            'ph': 'Binabati kita, Nanalo ka ng ${currency} ${prize}',
        };

        let jackpotNotification = {
            'en': '${playerName} Won ${currency}${wonAmount}!!',
            'zh-cn': '${playerName}赢了${currency}${wonAmount}!!',
            'ko': '${playerName} 승리 ${currency}${wonAmount}!!',
            'id': '${playerName} Memenangkan ${currency}${wonAmount}!!',
            'vi': '${playerName} Đã thắng ${currency}${wonAmount}!!',
            'th': '${playerName} ชนะ ${currency}${wonAmount}!!',
            'ms': '${playerName} Menang ${currency}${wonAmount}!!',
            'ph': '${playerName} Nanalo ng ${currency}${wonAmount}!!',
        };

        let myJackpotNotification = {
            'en': 'You Won ${currency}${wonAmount}!!',
            'zh-cn': '您赢得了 ${currency}${wonAmount}!!',
            'ko': '${currency}${wonAmount}을 획득하셨습니다!!',
            'id': 'Anda Memenangkan ${currency}${wonAmount}!!',
            'vi': 'Bạn đã giành được ${currency}${wonAmount}!!',
            'th': 'คุณได้รับ ${currency}${wonAmount}!!',
            'ms': 'Anda Memenangi ${currency}${wonAmount}!!',
            'ph': 'Nanalo ka ng ${currency}${wonAmount}!!',
        };

        let language: string = ( totalBetMessage[ currentLanguage ] ) ? currentLanguage : 'en';
        this.totalBetMessage = totalBetMessage[ language ];
        this.promotionNotification = promotionNotification[ language ];
        this.jackpotNotification = jackpotNotification[ language ];
        this.myJackpotNotification = myJackpotNotification[ language ];
    }
    /**
     * 使用正则表达式来匹配要替换的文本(totelBet)，并进行替换
     * @param minBet 
     * @returns 
     */
    public getTotalBetMessage ( minBet: any ): string {
        let str = this.totalBetMessage.replace( /\${minBet}/g, minBet );
        return str;
    }
    /**
     * 使用正则表达式来匹配要替换的文本(恭喜，您赢得了${currency}${prize})，并进行替换
     * @param currency 
     * @param prize 
     * @returns 
     */
    public getPromotionNotification ( currency: any, prize: any ): string {
        let str: string = this.promotionNotification
            .replace( /\${currency}/g, currency )
            .replace( /\${prize}/g, prize );
        return str;
    }
    /**
     * 使用正则表达式来匹配要替换的文本(${who}赢得了${currency}${wonAmount})，并进行替换
     * @param playerName 
     * @param currency 
     * @param wonAmount 
     * @param isYou 顯示 ‘你贏的了xxx’ 或是 ‘${playerName}贏的了xxx’ 
     * @returns 
     */
    public getJackpotNotification ( playerName: any, currency: any, wonAmount: any, isYou: boolean ): string {
        if ( isYou ) {
            let str: string = this.myJackpotNotification
                .replace( /\${currency}/g, currency )
                .replace( /\${wonAmount}/g, wonAmount );
            return str;
        }
        else {
            let str: string = this.jackpotNotification
                .replace( /\${playerName}/g, playerName )
                .replace( /\${currency}/g, currency )
                .replace( /\${wonAmount}/g, wonAmount );
            return str;
        }
    }
}

