import { _decorator, ITweenOption, Node, tween, UIOpacity, Vec3, TweenEasing } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 類別,特效(Effect)工具,使用tween,包括:
 * 1. fadeIn , UIOpacity 變為 255
 * 2. fadeOut, UIOpacity 變為 0 (透明)
 * 3. scaleUp, scale 變為 Vec3.ONE
 * 4. scaleDown, scale 變為 Vec3.ZERO
 */
@ccclass( 'EffectUtils' )
export class EffectUtils {
    /**
     * 淡入
     * @param target node
     * @param config 必需：config.duration,可選：config.easing,config.onComplete
     */
    public static fadeIn ( target: Node, config: IEffectConfig ): void {
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
    public static fadeOut ( target: Node, config: IEffectConfig ): void {
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
    public static scaleUp ( target: Node, config: IEffectConfig ): void {
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
    public static scaleDown ( target: Node, config: IEffectConfig ): void {
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
     * sample
     */
    public static open ( node: Node, Duration: number, Easing: TweenEasing ) {
        node.active = true;
        let config: IEffectConfig = {
            duration: Duration,
            easing: Easing,
        };
        EffectUtils.scaleUp( node, config );
        EffectUtils.fadeIn( node, config );
    }
    /**
     * sample
     */
    public static scaleUpTo ( node: Node, Duration: number, Easing: TweenEasing , to:Vec3 ) {
        node.active = true;
        let option: ITweenOption = {};
        let config: IEffectConfig = {
            duration: Duration,
            easing: Easing,
            };
            if ( config.easing ) {
                option.easing = config.easing;
            }
            if ( config.onComplete ) {
                option.onComplete = config.onComplete;
        }
        tween( node )
            .to( config.duration, { scale: to }, option )
            .start();
    }

    /**
     * sample 
     */
    public static close ( node: Node, Duration: number, Easing: TweenEasing, active: boolean ) {
        let config: IEffectConfig = {
            duration: Duration,
            easing: Easing,
            onComplete: ( target?: object ) => {
                node.active = active;
            }
        };
        EffectUtils.scaleDown( node, config );
        EffectUtils.fadeOut( node, config );
    }
}

export interface IEffectConfig {
    duration: number;
    easing?: TweenEasing;
    onComplete?: ( target?: object ) => void;
}
