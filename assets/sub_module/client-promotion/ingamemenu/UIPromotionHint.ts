import { _decorator, Component, Enum, Label, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
import { igmButtonUtils } from '../utils/igmButtonUtils';
import { igmEffectUtils, igmMoveEffectConfig, igmTweenEasingEnum } from '../utils/igmEffectUtils';
import { ShowPopupButtonType } from './FloatingBoard';
const { ccclass, property } = _decorator;
/**
 * 類別,浮動式按鈕的彈出式訊息,處理訊息的tween
 */
@ccclass( 'UIPromotionHint' )
export class UIPromotionHint extends Component {
    @property( { type: Enum( ShowPopupButtonType ) } )
    public buttonType: ShowPopupButtonType = ShowPopupButtonType.LEFT_POPUP;

    @property( { type: Node } )
    public nodeCurrent !: Node;

    @property( { type: Label } )
    public labelTitle !: Label;

    @property( { type: Label } )
    public labelMessage !: Label;

    @property( { type: Sprite } )
    public spriteIcon !: Sprite;

    @property( { type: [ SpriteFrame ] } )
    public spriteFrameIcon: SpriteFrame[] = [];

    /** tween */
    @property
    public tweenDuration: number = 0.5;//seconds
    @property
    public tweenDistance: number = 100;//pixel
    @property
    public waitTime: number = 10;//seconds

    @property({ type: Vec3 })
    public originalPosition: Vec3 ;//initial position
    //protected value
    protected iconPositionX: number = 0;
    protected messageQueue: any[] = [];
    protected backTimeout: any;
    protected isNeedOffset: any;

    start (): void {
        igmButtonUtils.setNodeEventOnHover( this.nodeCurrent );
        //this.originalPosition = this.nodeCurrent.getPosition();
    }

    onDestroy (): void {
        igmButtonUtils.setNodeEventOffHover( this.nodeCurrent );
    }

    //按鈕
    public onClick (): void {
        clearTimeout( this.backTimeout );

        this.hideHint();
    }

    public init ( iconPosition: number ): void {
        this.iconPositionX = iconPosition;
    }

    public resetPosition (): void {
        clearTimeout( this.backTimeout );
        this.messageQueue.length = 0;//clear
        this.nodeCurrent.setPosition( this.originalPosition );
    }

    jackpotPopUpSetting ( isSelf ) {
        this.isNeedOffset = isSelf;
    }
    /**
     * 彈出訊息
     * @param title string
     * @param message string
     * @param jpTier string,jackpot tier,'grand','major','minor','mini'
     */
    popOutHint ( title, message, jpTier ) {
        // 先把訊息丟到序列裡面
        this.messageQueue.push( {
            title: title,
            message: message,
            jpTier: jpTier,
            isOffset: this.isNeedOffset
        } );
        // 只有一個訊息表示第一次進來
        if ( this.messageQueue.length === 1 ) {
            this.showHint();
        }
    }
    /**
     * 顯示訊息(tween)
     */
    showHint () {
        this.labelTitle.string = this.messageQueue[ 0 ].title;
        this.labelMessage.string = this.messageQueue[ 0 ].message;

        if ( this.messageQueue[ 0 ].jpTier && this.messageQueue[ 0 ].jpTier != '' ) {
            this.spriteIcon.node.active = true;
            let index: number = 0;
            switch ( this.messageQueue[ 0 ].jpTier ) {
                case 'grand':
                    index = 0;
                    break;
                case 'major':
                    index = 1;
                    break;
                case 'minor':
                    index = 2;
                    break;
                case 'mini':
                    index = 3;
                    break;
            }
            this.spriteIcon.spriteFrame = this.spriteFrameIcon[ index ];
            let position: Vec3 = this.spriteIcon.node.getPosition();
            if ( this.messageQueue[ 0 ].isOffset ) {
                this.spriteIcon.node.setPosition( this.iconPositionX - 30, position.y, 0 );
            } else {
                this.spriteIcon.node.setPosition( this.iconPositionX, position.y, 0 );
            }
        }
        else {
            this.spriteIcon.node.active = false;
        }

        let direction: number = 1;//正是往右，負是往左
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            direction = -1;//往左
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            direction = 1;//往右
        }
        let position = this.originalPosition;
        let config: igmMoveEffectConfig = {
            duration: this.tweenDuration,
            easing: igmTweenEasingEnum.linear,
            onComplete: ( target?: object ) => {
                this.backTimeout = setTimeout( () => {
                    this.hideHint();
                }, this.waitTime * 1000 );
            },
            from: position,
            to: new Vec3( position.x + direction * this.tweenDistance, position.y, 0 )
        };
        igmEffectUtils.moveTo( this.nodeCurrent, config );
    }
    /**
     * 提示訊息收進去(tween)
     */
    public hideHint (): void {
        let direction: number = 1;//正是往右，負是往左
        //收回去是反方向,LEFT往右,RIGHT往左
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            direction = 1;//往右
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            direction = -1;//往左
        }
        let position = this.nodeCurrent.getPosition();
        let config: igmMoveEffectConfig = {
            duration: this.tweenDuration,
            easing: igmTweenEasingEnum.linear,
            onComplete: ( target?: object ) => {
                // 提示框收進去之後就把訊息從序列移除, 接著顯示下一條訊息
                this.messageQueue.splice( 0, 1 );
                if ( this.messageQueue.length > 0 ) {
                    this.showHint();
                }
            },
            from: position,
            to: new Vec3( position.x + direction * this.tweenDistance, position.y, 0 )
        };
        igmEffectUtils.moveTo( this.nodeCurrent, config );
    }
}

