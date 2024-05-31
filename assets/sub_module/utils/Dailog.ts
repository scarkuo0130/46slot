import { _decorator, Asset, Component, EventHandler, JsonAsset, Label, Node, resources, Sprite, Vec3 } from 'cc';
import { t } from 'xstate';
import { gversion, Utils } from './Utils';
import { gameInformation } from '../game/GameInformation';
import { PREVIEW } from 'cc/env';
const { ccclass, property, help } = _decorator;

@ccclass('Dailog')
@help('https://docs.google.com/document/d/1Ex5b655WB7vGIRSSSAyUD1LjCi7CU4YBgnkNocn-OqQ/edit?usp=sharing')
export class Dailog extends Component {

    @property({ displayName:'DevelopCloseError', tooltip:'開發期開關', group:{name: "develop", id:"0"} })
    public developCloseError: boolean = false;
    
    @property({ type: Node, displayName: "Mask", tooltip: "遮罩", group:{name: "base", id:"0"} })
    public mask: Node = null;

    @property({ type:Sprite, displayName: "Background", tooltip: "背景", group:{name: "base", id:"0"} })
    public background: Sprite = null;

    @property({ type:Label, displayName: "Title", tooltip: "標題", group:{name: "base", id:"0"} })
    public title: Label = null;

    @property({ type:Label, displayName: "Content", tooltip: "內容", group:{name: "base", id:"0"} })
    public content: Label = null;

    @property({ type:Node, displayName: "Button", tooltip: "按鈕", group:{name: "base", id:"0"} })
    public button: Node = null;

    @property({ type:Label, displayName: "ButtonLabel", tooltip: "按鈕文字", group:{name: "base", id:"0"} })
    public buttonLabel: Label = null;

    @property({ type:Label, displayName: "Version", tooltip: "版本顯示", group:{name: "base", id:"0"} })
    public versionLabel: Label = null;

    public static Instance : Dailog;

    protected onLoad(): void {
        Dailog.Instance = this;
        this.node.active = false;
        cc.Dailog = this;
        this.node.position = Vec3.ZERO;
        this.getErrorData();
    }

    protected start(): void {
        this.versionLabel.string = `Ver: ${gversion}`;
    }

    public errorMessageData = null;
    public getErrorData(callback: EventHandler = null) {
        if (this.errorMessageData != null) return callback?.emit([this.errorMessageData]);
        resources.load('data/ErrorMessage', JsonAsset, (err, errorData) => {
            if (err != null) return console.error(err);
            Dailog.Instance.errorMessageData = errorData.json;
            callback?.emit([errorData.json]);
        });
    }

    public static Display(title:string, content:string, buttonLabel:string, clickEvent:Function=null, clickMask:Function=null) { return Dailog.Instance.display(title, content, buttonLabel, clickEvent, clickMask); }
    public display(title:string, content:string, buttonLabel:string, clickEvent:Function=null, clickMask:Function=null): void {
        this.title.string = title;
        this.content.string = content;
        this.buttonLabel.string = buttonLabel;
        this.node.active = true;
        this.clickFunc = clickEvent;
        this.clickMaskFunc = clickMask;

        if ( buttonLabel == null || buttonLabel.length === 0 || clickEvent == null ) {
            this.button.active = false;
        } else {
            this.button.active = true;
        }

    }

    public clickFunc = null;
    public clickConfirm() {
        this.node.active = false;
        if (this.clickFunc) this.clickFunc();
    }

    public clickMaskFunc = null;
    public clickMask() { if (this.clickMaskFunc) this.clickMaskFunc(); }

    public static ErrorMessage(errorCode:number) { return Dailog.Instance.errorMessage(errorCode); }

    public errorMessage(errorCode:number) {
        if ( PREVIEW && this.developCloseError === true ) return;
        let errorData = this.errorMessageData[errorCode];
        if (errorData == null) errorData = this.errorMessageData['default'];

        let lang = gameInformation.lang;
        let title = errorData.Title;
        let langMessage = errorData.Message;
        let content = this.errorMessageData.ErrorMessage[langMessage][lang];
        if (content == null) content = this.errorMessageData.ErrorMessage[langMessage]['en'];
        
        content = Utils.stringFormat(content, errorCode);
        let buttonLabel = errorData.ConfirmText;
        let callback = this.ErrorConfirmCallback[errorData.ConfirmType];

        this.display(title, content, buttonLabel, callback, null);
    }

    public ErrorConfirmCallback = {
        0: null,
        1: function() { window.location.reload(); },
        2: function() { Dailog.Instance.node.active = false; },
    };
}
