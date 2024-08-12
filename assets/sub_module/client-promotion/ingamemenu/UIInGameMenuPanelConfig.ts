import { _decorator, Vec3 } from 'cc';
import { igmOrientation } from '../utils/igmViewport';
const { ccclass, property } = _decorator;

@ccclass( 'UIInGameMenuPanelConfig' )
export class UIInGameMenuPanelConfig {
    public floatingBoardCurrent: Map<igmOrientation, Vec3> = new Map<igmOrientation, Vec3>( [
        [ igmOrientation.PORTRAIT, new Vec3( 460, 560, 0 ) ],
        [ igmOrientation.LADNSCAPE, new Vec3( 750, 260, 0 ) ],
    ] );
  
    public buttonInGameMenu: Map<igmOrientation, Vec3> = new Map<igmOrientation, Vec3>( [
        [ igmOrientation.PORTRAIT, new Vec3( 400, 350, 0 ) ],
        [ igmOrientation.LADNSCAPE, new Vec3( 690, 140, 0 ) ],
    ] );

    public JackpotHintSpriteIcon: Map<igmOrientation, Vec3> = new Map<igmOrientation, Vec3>( [
        [ igmOrientation.PORTRAIT, new Vec3( 120, 0, 0 ) ],
        [ igmOrientation.LADNSCAPE, new Vec3( 120, 0, 0 ) ],
    ] );
}

