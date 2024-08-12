import { _decorator, Button, Color, game, Node, sp, Sprite } from 'cc';
const { ccclass, property } = _decorator;
/**
 * 類別,buttons相關工具
 */
@ccclass( 'igmButtonUtils' )
export class igmButtonUtils {
    /**
     * 設定 按鈕 底下(InChildren)的圖片的顏色,禁能時壓灰
     * @param button 
     * @param disabledColor 禁用時的顏色
     */
    public static setButtonChildrenSpriteColor ( button: Button, disabledColor: Color ): void {
        let sprite = button.getComponentInChildren( Sprite );
        if ( button.interactable === true ) {
            sprite.color = Color.WHITE;
        }
        else {
            sprite.color = disabledColor;
        }
    }
    /**
     * 設定 按鈕 本身的spine的顏色,禁能時壓灰
     * @param button 
     * @param disabledColor 禁用時的顏色
     */
    public static setButtonSpineColor ( button: Button, disabledColor: Color ): void {
        let spine: sp.Skeleton = button.node.getComponent( sp.Skeleton );
        if ( spine ) {
            if ( button.interactable === true ) {
                spine.color = Color.WHITE;
            }
            else {
                spine.color = disabledColor;
            }
        }
    }
    /**
     * 設定 按鈕 本身的圖片的顏色
     * @param button 
     * @param setColor 顏色
     */
    public static setButtonSpriteColor ( button: Button, setColor: Color ): void {
        let sprite = button.getComponent( Sprite );
        sprite.color = setColor;
    }
    /**
     * 注冊按鈕上的節點事件 滑過按鈕時的滑鼠指標
     * @param button 
     */
    public static setButtonEventOnHover ( button: Button ): void {
        button.node.on( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
        button.node.on( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );
    }
    /**
     * 變更滑鼠指標為 手指
     */
    public static onButtonHover (): void {
        game.canvas.style.cursor = 'pointer';//手指
    }
    /**
     * 回復滑鼠指標為 箭頭(預設)
     */
    public static onButtonLeave (): void {
        game.canvas.style.cursor = 'default';//箭頭
    }
    /**
     * 刪除按鈕上的節點事件
     */
    public static setButtonEventOffHover ( button: Button ): void {
        button.node.off( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
        button.node.off( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );
    }
    /**
     * 注冊節點事件 滑過node時的滑鼠指標
     * @param target node
     */
    public static setNodeEventOnHover ( target: Node ): void {
        target.on( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
        target.on( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );
    }
    /**
     * 刪除節點事件
     * @param target node
     */
    public static setNodeEventOffHover ( target: Node ): void {
        target.off( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
        target.off( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );
    }
}

