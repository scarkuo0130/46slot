import { _decorator, Component, Enum, Toggle, Vec3, Button, Sprite, AudioSource } from 'cc';
import { igmEffectUtils, igmMoveEffectConfig, igmTweenEasingEnum } from '../utils/igmEffectUtils';
import { igmButtonUtils } from '../utils/igmButtonUtils';
import { ShowPopupButtonType } from './FloatingBoard';
const { ccclass, property } = _decorator;
/**
 * 類別,浮動式按鈕+左或右箭頭toggle,處理按鈕的tween
 */
@ccclass('FloatingButton')
export class FloatingButton extends Component {
    @property( { type: Enum( ShowPopupButtonType ) } )
    public buttonType: ShowPopupButtonType = ShowPopupButtonType.LEFT_POPUP;

    @property( { type: Button } )
    public buttonCurrent !: Button;

    @property( { type: Sprite } )
    public spriteBackground !: Sprite;

    @property( { type: Toggle } )
    public toggleLeft !: Toggle;
    @property( { type: Toggle } )
    public toggleRight !: Toggle;

    //tween
    @property
    public tweenDuration: number = 0.3;//seconds
    @property
    public tweenDistance: number = 100;//seconds
    protected isMoveImmediate:boolean = false ;//false = move with tween

    //sound
    @property (AudioSource)
    public audioSource !:AudioSource; 
    protected soundMuted:boolean = false ;

    start () {
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            this.toggleLeft.node.active = true;
            this.toggleRight.node.active = false;
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            this.toggleLeft.node.active = false;
            this.toggleRight.node.active = true;
        }
        else {
            this.toggleLeft.node.active = false;
            this.toggleRight.node.active = false;
        }

        igmButtonUtils.setNodeEventOnHover( this.buttonCurrent.node );
        igmButtonUtils.setNodeEventOnHover( this.toggleLeft.node );
        igmButtonUtils.setNodeEventOnHover( this.toggleRight.node );
    }

    onDestroy (): void {
        igmButtonUtils.setNodeEventOffHover( this.buttonCurrent.node );
        igmButtonUtils.setNodeEventOffHover( this.toggleLeft.node );
        igmButtonUtils.setNodeEventOffHover( this.toggleRight.node );
    }

    public onButtonClick (): void {
        this.playSound();
    }

    public onShow ( position: Vec3 ): void {
        this.node.setPosition( position );
    }
    /**
     * reset position後,toggle也要reset
     */
    public resetToggle():void{
        this.isMoveImmediate = true ;
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            this.toggleLeft.isChecked = true ;
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
            this.toggleRight.isChecked = true ;
        }
        this.isMoveImmediate = false ;
    }
    /**
     * 箭頭(toggle)押下後,按鈕(button)往左或右
     */
    public onToggleClick (): void {
        if (this.isMoveImmediate === true){
            return ;
        }
        let state: boolean = true;
        let direction: number = 1;//正是往右，負是往左
        if ( this.buttonType === ShowPopupButtonType.LEFT_POPUP ) {
            state = this.toggleLeft.isChecked;
            if ( state === true ) {
                direction = 1;//往右
            }
            else {
                direction = -1;
            }
        }
        else if ( this.buttonType === ShowPopupButtonType.RIGHT_POPUP ) {
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
        //
        let position = this.node.getPosition();
        let config: igmMoveEffectConfig = {
            duration: this.tweenDuration,
            easing: igmTweenEasingEnum.linear,
            onComplete: ( target?: object ) => {
            },
            from: position,
            to: new Vec3( position.x + direction * this.tweenDistance, position.y, 0 )
        };
        igmEffectUtils.moveTo( this.node, config );
    }
    /**
     * 播放按鍵音效
     */
    public playSound ( volume:number = 1.0,loop:boolean = false ): void {
        if ( !this.audioSource ) {
            return;
        }
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
    public setSoundMuted(set:boolean) { 
        this.soundMuted = set ; 
    }
}


