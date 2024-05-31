import { _decorator, Button, Color, game, Node, sp, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'ButtonUtils' )
export class ButtonUtils {
    public static setButtonChildrenSpriteColor ( button: Button, disabledColor: Color ): void {
        let sprite = button.getComponentInChildren( Sprite );
        if ( button.interactable === true ) {
            sprite.color = Color.WHITE;
        }
        else {
            sprite.color = disabledColor;
        }
    }

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

    public static setSpineOpacity ( spine: sp.Skeleton, opacity: number ): void {
        if ( spine ) {
            let temp:Color = spine.color ;
            temp = new Color( temp.r, temp.g, temp.b, opacity );
            spine.color = temp;
        }
    }

    public static setButtonEventOnHover ( button: Button ): void {
        button.node.on( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
        button.node.on( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );

    }

    public static onButtonHover (): void {
        game.canvas.style.cursor = 'pointer';//手指
    }

    public static onButtonLeave (): void {
        game.canvas.style.cursor = 'default';//箭頭
    }

    public static setButtonEventOffHover ( button: Button ): void {
        if ( button.node ) {
            button.node.off( Node.EventType.MOUSE_ENTER, this.onButtonHover, this );
            button.node.off( Node.EventType.MOUSE_LEAVE, this.onButtonLeave, this );
        }
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

