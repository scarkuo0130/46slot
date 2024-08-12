import { _decorator, Component, sp } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 播放spine Animation 
 */
@ccclass( 'igmSpineAnimation' )
export class igmSpineAnimation extends Component {
    @property( { type: sp.Skeleton } )
    public skeleton !: sp.Skeleton;
    @property( { type: sp.SkeletonData } )
    public skeletonData !: sp.SkeletonData;
    @property
    public duration:number = 0 ;
    start () {
        if ( this.skeletonData ) {
            if ( this.skeleton ) {
                this.skeleton.skeletonData = this.skeletonData;
            }
        }
    }
    /**
     * 設定 sp.SkeletonData
     * @param skeletonData 
     */
    public replaceSkeletonData ( skeletonData: sp.SkeletonData ) {
        this.skeletonData = skeletonData;
        this.skeleton.skeletonData = skeletonData;
    }
    /**
     * 播放spine Animation,呼叫 AnimationState.setAnimation()
     * @param trackIndex default set 0
     * @param name animation name
     * @param loop default is false
     */
    public playAnimation ( trackIndex: number, name: string, loop: boolean = false ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        let trackEntry2 = animationState?.setAnimation( trackIndex, name, loop );//可選鏈 防止null
        this.duration = this.getAnimationDuration(name) ;
    }
    /**
     * 播放spine Animation,呼叫 AnimationState.setAnimation()
     * @param trackIndex default set 0
     * @param name animation name
     * @param loop boolean
     * @param callback call sp.spine.TrackEntry.setTrackCompleteListener()
     */
    public playAnimationCompleted ( trackIndex: number, name: string, loop: boolean, callback?: Function ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        let trackEntry2:sp.spine.TrackEntry = animationState?.setAnimation( trackIndex, name, loop );//可選鏈 防止null
        this.duration = this.getAnimationDuration(name) ;
        this.skeleton.setTrackCompleteListener( trackEntry2, ( track2Entry: sp.spine.TrackEntry, loop: any ) => {
            if ( callback ) {
                //console.log( "Animation duration:", trackEntry2.animation.duration );
                callback();
            }
        } );
    }
    /**
     * 添加一个待播放动画, 在某轨道的当前或最后一个排队动画之后播放. 若该轨道为空, 则相当于调用setAnimation.
     * http://zh.esotericsoftware.com/spine-api-reference#AnimationState-addAnimation
     * @param trackIndex number
     * @param animationName string 
     * @param loop boolean
     * @param delay default is 0
     */
    public addAnimation ( trackIndex: number, animationName: string, loop: boolean, delay: number = 0 ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        let trackEntry2 = animationState?.addAnimation( trackIndex, animationName, loop, delay );//可選鏈 防止null
    }
    /**
     * 呼叫 AnimationState.addAnimation()
     * @param trackIndex 
     * @param animationName 
     * @param loop 
     * @param delay 
     * @param callback 
     */
    public addAnimationCompleted ( trackIndex: number, animationName: string, loop: boolean, delay: number, callback?: Function ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        let trackEntry2 = animationState?.addAnimation( trackIndex, animationName, loop, delay );//可選鏈 防止null
        this.skeleton.setTrackCompleteListener( trackEntry2, ( track2Entry: sp.spine.TrackEntry, loop: any ) => {
            if ( callback ) {
                callback();
            }
        } );
    }
    /**
     * 清空当前动画状态 , 呼叫 AnimationState.setEmptyAnimation()
     * @param track 
     */
    public resetAnimation ( track: number ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        animationState.setEmptyAnimation( track, 0 );
    }
    /**
     * track<0 呼叫 AnimationState.clearTracks() 或 AnimationState.clearTrack( track );
     * @param track 
     */
    public stop ( track: number ): void {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        if ( track < 0 ) {
            animationState?.clearTracks();
        }
        else {
            animationState?.clearTrack( track );
        }
    }
    /**
     * 取得 动画长度（秒）
     * @param animationName 
     * @returns sp.spine.Animation.duration
     */
    public getAnimationDuration ( animationName: string ): number {
        let animationState: sp.spine.AnimationState = this.skeleton.getState()!;
        const animation:sp.spine.Animation = animationState?.data.skeletonData.findAnimation( animationName );
        return animation?.duration ?? 0 ;//空值合并，当左侧的操作数为 null 或者 undefined 时，返回其右侧操作，否则返回左侧。
    }
}

