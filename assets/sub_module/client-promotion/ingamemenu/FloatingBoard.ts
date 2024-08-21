import { _decorator, Component, Enum, Toggle, Vec3, Node, AudioSource, ITweenOption, tween } from 'cc';
import { igmMoveEffectConfig, igmTweenEasingEnum } from '../utils/igmEffectUtils';
import { Utils } from '../../utils/Utils';
import { igmButtonUtils } from '../utils/igmButtonUtils';
import { PLAY_MODE, SoundManager } from '../../game/machine/SoundManager';
const { ccclass, property } = _decorator;
export enum ShowPopupButtonType {
    NONE,  //不顯示
    LEFT_POPUP,//左
    RIGHT_POPUP,//右
}
/**
 * 類別,浮動式按鈕+左或右箭頭toggle,處理按鈕的tween
 * @20231103修正後,本身不具備按鈕
 */
@ccclass( 'FloatingBoard' )
export class FloatingBoard extends Component {
    @property( { type: Enum( ShowPopupButtonType ) } )
    public buttonType: ShowPopupButtonType = ShowPopupButtonType.LEFT_POPUP;
    protected originalType: ShowPopupButtonType = ShowPopupButtonType.LEFT_POPUP;;//initial value

    @property( { type: Toggle } )
    public toggleLeft !: Toggle;
    @property( { type: Toggle } )
    public toggleRight !: Toggle;

    /** 小紅點 */
    @property( { type: Node } )
    public nodeBadge !: Node;
    protected isDoneBadge = false;
    protected tweenMove;

    /** tween */
    @property
    public tweenDuration: number = 0.3;//seconds
    @property
    public tweenDistance: number = 100;//pixel
    protected isMoveImmediate: boolean = false;//false = move with tween

    //sound
    @property( AudioSource )
    public audioSource !: AudioSource;
    protected soundMuted: boolean = false;

    start () {
        this.originalType = this.buttonType;
        this.resetToggle();
        igmButtonUtils.setNodeEventOnHover( this.toggleLeft.node );
        igmButtonUtils.setNodeEventOnHover( this.toggleRight.node );
    }

    onDestroy (): void {
        igmButtonUtils.setNodeEventOffHover( this.toggleLeft.node );
        igmButtonUtils.setNodeEventOffHover( this.toggleRight.node );
    }

    public setTweenDistance ( distance: number ): void {
        this.tweenDistance = distance;
    }

    public onButtonClick (): void {
        this.playSound();
    }

    public onShow ( position: Vec3 ): void {
        this.node.setPosition( position );
    }

    public resetPosition (): void {
        this.buttonType = this.originalType;
        this.resetToggle();
        if ( this.isMoveImmediate === true ) {
            if ( this.tweenMove ) {
                this.tweenMove.stop(); // Stop the tween
                this.tweenMove = null; // Remove the reference
            }
            this.isMoveImmediate = false;
        }
    }
    /**
     * reset position後,toggle也要reset
     */
    public resetToggle (): void {
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            this.toggleLeft.node.active = true;
            this.toggleLeft.isChecked = true;
            this.toggleRight.node.active = false;
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            this.toggleRight.node.active = true;
            this.toggleRight.isChecked = true;
            this.toggleLeft.node.active = false;
        }
        else {
            this.toggleLeft.node.active = false;
            this.toggleRight.node.active = false;
        }
    }

    public async closeToggle() {
        console.log('closeToggle', this.toggleLeft.isChecked);
        if ( this.toggleLeft.isChecked === true ) return;
        this.onToggleClick();
    }
    /**
     * 箭頭(toggle)押下後,按鈕(button)往左或右
     */
    public async onToggleClick (): Promise<void> {
        if ( this.isMoveImmediate === true ) {
            return;
        }
        this.isMoveImmediate = true;
        if ( this.isDoneBadge === false ) {
            this.isDoneBadge = true;
            this.nodeBadge.active = false;
        }
        let state: boolean = true;
        let direction: number = 1;//正是往右，負是往左
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            this.buttonType = ShowPopupButtonType.RIGHT_POPUP;
            this.resetToggle();
            state = this.toggleLeft.isChecked;
            if ( state === true ) {
                direction = 1;//往右
            }
            else {
                direction = -1;
            }
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            this.buttonType = ShowPopupButtonType.LEFT_POPUP;
            this.resetToggle();
            state = this.toggleRight.isChecked;
            if ( state === true ) {
                direction = -1;//往左
            }
            else {
                direction = 1;
            }
        }
        else {
            return;
        }
        //
        this.playSound();
        //tween move
        let position = this.node.getPosition();
        let config: igmMoveEffectConfig = {
            duration: this.tweenDuration,
            easing: igmTweenEasingEnum.linear,
            onComplete: ( target?: object ) => {
            },
            from: position,
            to: new Vec3( position.x + direction * this.tweenDistance, position.y, 0 )
        };
        let option: ITweenOption = {};
        this.node.setPosition( config.from );
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        this.tweenMove = tween( this.node )
            .to( config.duration, { position: config.to }, option )
            .start();
        await Utils.delay( this.tweenDuration * 1000 );
        this.isMoveImmediate = false;
    }
    /**
     * 播放按鍵音效
     */
    public playSound ( volume: number = 1.0, loop: boolean = false ): void {
        if ( !this.audioSource ) return;
        if ( SoundManager.Mode === PLAY_MODE.NO_SOUND ) return;
        
        this.audioSource.loop = loop;
        if ( this.soundMuted ) {
            this.audioSource.volume = 0;
        } else {
            this.audioSource.volume = volume;
        }
        this.audioSource.play();
    }
    /**
     * 靜音
     * toDo ..
     */
    public setSoundMuted ( set: boolean ) {
        this.soundMuted = set;
    }
}

