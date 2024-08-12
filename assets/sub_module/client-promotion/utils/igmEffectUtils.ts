import { _decorator, ITweenOption, Node, tween, UIOpacity, Vec3, TweenEasing, Label } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 類別,特效(Effect)工具,使用tween,包括:
 * 1. fadeIn , UIOpacity 變為 255
 * 2. fadeOut, UIOpacity 變為 0 (透明)
 * 3. scaleUp, scale 變為 Vec3.ONE
 * 4. scaleDown, scale 變為 Vec3.ZERO
 * 5. moveTo, 位移
 * 6. labelCountTo, 跑分
 * 7. labelMultiplierCountTo, 跑分
 */
@ccclass( 'igmEffectUtils' )
export class igmEffectUtils {
    /**
     * 淡入
     * @param target node
     * @param config 必需：config.duration,可選：config.easing,config.onComplete
     */
    public static fadeIn ( target: Node, config: igmEffectConfig ): void {
        let uiOpacity: UIOpacity = target.getComponent<UIOpacity>( UIOpacity ) ?? target.addComponent<UIOpacity>( UIOpacity );
        let option: ITweenOption = {};
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween( uiOpacity )
            .to( config.duration, { opacity: 255 }, option )
            .start();
    }
    /**
     * 淡出
     * @param target node
     * @param config 必需：config.duration,可選：config.easing,config.onComplete
     */
    public static fadeOut ( target: Node, config: igmEffectConfig ): void {
        let uiOpacity: UIOpacity = target.getComponent<UIOpacity>( UIOpacity ) ?? target.addComponent<UIOpacity>( UIOpacity );
        let option: ITweenOption = {};
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween( uiOpacity )
            .to( config.duration, { opacity: 0 }, option )
            .start();
    }
    /**
     * 放大
     * @param target node
     * @param config 必需：config.duration,可選：config.easing,config.onComplete
     */
    public static scaleUp ( target: Node, config: igmEffectConfig ): void {
        let option: ITweenOption = {};
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween( target )
            .to( config.duration, { scale: Vec3.ONE }, option )
            .start();
    }
    /**
     * 縮小
     * @param target node
     * @param config 必需：config.duration,可選：config.easing,config.onComplete
     */
    public static scaleDown ( target: Node, config: igmEffectConfig ): void {
        let option: ITweenOption = {};
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween( target )
            .to( config.duration, { scale: Vec3.ZERO }, option )
            .start();
    }
    /**
     * 位移
     * @param target node
     * @param config 必需：config.duration,config.from,config.to:Vec3 ,可選：config.easing,config.onComplete
     */
    public static moveTo ( target: Node, config: igmMoveEffectConfig ): void {
        let option: ITweenOption = {};
        target.setPosition( config.from );
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween( target )
            .to( config.duration, { position: config.to }, option )
            .start();
    }
    /**
     * 用tween做的簡易計時器，Tween 具有强大的缓动功能，可以实现更复杂的时间动画，如缓入、缓出等效果，
     * 如果只需要一个简单的计时器，setInterval 或 setTimeout 也是可以的，
     * @param config 
     */
    public static setTweenTimer(config: igmEffectConfig):void{
        let option: ITweenOption = {};
        if ( config.easing ) {
            option.easing = config.easing;
        }
        if ( config.onComplete ) {
            option.onComplete = config.onComplete;
        }
        tween({})
            .to(config.duration, {}, option)//不改变任何属性，用作计时器
            .start();
    }
}

export interface igmEffectConfig {
    duration: number;
    easing?: TweenEasing;
    onComplete?: ( target?: object ) => void;
}

export interface igmMoveEffectConfig extends igmEffectConfig {
    from: Vec3;
    to: Vec3;
}


export const enum igmTweenEasingEnum {
    linear = 'linear',
    smooth = 'smooth',
    fade = 'fade',
    constant = 'constant',
    quadIn = 'quadIn',
    quadOut = 'quadOut',
    quadInOut = 'quadInOut',
    quadOutIn = 'quadOutIn',
    cubicIn = 'cubicIn',
    cubicOut = 'cubicOut',
    cubicInOut = 'cubicInOut',
    cubicOutIn = 'cubicOutIn',
    quartIn = 'quartIn',
    quartOut = 'quartOut',
    quartInOut = 'quartInOut',
    quartOutIn = 'quartOutIn',
    quintIn = 'quintIn',
    quintOut = 'quintOut',
    quintInOut = 'quintInOut',
    quintOutIn = 'quintOutIn',
    sineIn = 'sineIn',
    sineOut = 'sineOut',
    sineInOut = 'sineInOut',
    sineOutIn = 'sineOutIn',
    expoIn = 'expoIn',
    expoOut = 'expoOut',
    expoInOut = 'expoInOut',
    expoOutIn = 'expoOutIn',
    circIn = 'circIn',
    circOut = 'circOut',
    circInOut = 'circInOut',
    circOutIn = 'circOutIn',
    elasticIn = 'elasticIn',
    elasticOut = 'elasticOut',
    elasticInOut = 'elasticInOut',
    elasticOutIn = 'elasticOutIn',
    backIn = 'backIn',
    backOut = 'backOut',
    backInOut = 'backInOut',
    backOutIn = 'backOutIn',
    bounceIn = 'bounceIn',
    bounceOut = 'bounceOut',
    bounceInOut = 'bounceInOut',
    bounceOutIn = 'bounceOutIn',
}