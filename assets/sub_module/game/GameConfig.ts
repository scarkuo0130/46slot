import { Component, _decorator } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'GameConfig' )
export class GameConfig extends Component {
    public static Instance: GameConfig;

    protected onLoad (): void {
        GameConfig.Instance = this;
    }

    public static setConfig ( config ) { Config = config; }
}
export var Config = null;

