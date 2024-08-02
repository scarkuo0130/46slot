import { _decorator, Component, Node, Button, Label } from 'cc';
import { Utils, DATA_TYPE } from '../utils/Utils';
import { Controller } from './machine/controller_folder/Controller';
import { i18n } from '../utils/i18n';
const { ccclass, property } = _decorator;

@ccclass('DialogUI')
export class DialogUI extends Component {
    private initData = {
        'items' : {
            'close'   : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.NODE_PATH] : 'Background/Close',        [DATA_TYPE.CLICK_EVENT]: this.closeUI  },
            'title'   : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'Background/Title',        [DATA_TYPE.CLICK_EVENT]: null  },
            'content' : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'Background/Content',      [DATA_TYPE.CLICK_EVENT]: null },
            'confirm'  : { [DATA_TYPE.TYPE] : Button, [DATA_TYPE.NODE_PATH] : 'Background/Confirm',       [DATA_TYPE.CLICK_EVENT]: this.clickConfirm  },
            'version' : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'Background/Version',      [DATA_TYPE.CLICK_EVENT]: null },
            'okLabel' : { [DATA_TYPE.TYPE] : Label,  [DATA_TYPE.NODE_PATH] : 'Background/Confirm/Label', [DATA_TYPE.CLICK_EVENT]: null },
        }
    };

    private properties = {
        'clickEvent' : null,
        'activeClose' : false,
        'items' : {
            'close'     : null,
            'title'     : null,
            'content'   : null,
            'confirm'    : null,
            'version'   : null,
            'okLabel'   : null,
        },
    };

    public static Instance: DialogUI = null;

    protected onLoad(): void { this.init(); }

    public static ErrorMessage:any = null;

    private async init(): void {
        DialogUI.Instance = this;
        this.node.active = false;
        this.node.setPosition(0,0,0);
        Utils.initData(this.initData, this);

        if ( DialogUI.ErrorMessage === null ) {
            DialogUI.ErrorMessage = await Utils.loadJson('data/ErrorMessage');
            console.log(DialogUI.ErrorMessage);
        }
    }

    private closeUI(): void {
        Utils.commonActiveUITween(this.node, false);
        Controller.MaskActive(false);
    }

    public static confirmEvent = {
        '0': null,
        '1' : () => { location.reload(); },
        '2' : () => { DialogUI.Instance.closeUI(); },
    };
    public static OpenErrorMessage(errorCode:string) {
        console.log('OpenErrorMessage', errorCode);
        let messageData = DialogUI.ErrorMessage[errorCode];
        if ( messageData == null ) {
            messageData = DialogUI.ErrorMessage['default'];
        }

        const language = i18n.getLanguage() ? i18n.getLanguage() : 'en';
        const messageType = DialogUI.ErrorMessage['ErrorMessage'][messageData['Message']];
        const message = Utils.stringFormat(messageType[language], errorCode);
        const confirmType = messageData['ConfirmType'];
        DialogUI.Instance.openUI(message, true, 'Error', DialogUI.confirmEvent[confirmType], 'ok');
    }

    public static OpenUI(content:string, activeClose=false, title:string='', clickEvent:Function=null, okLabel:string='ok'): void { return DialogUI.Instance.openUI(content, activeClose, title, clickEvent, okLabel); }
    public openUI(content:string, activeClose=false, title:string='', clickEvent:Function=null, okLabel:string='ok'): void {
        this.properties.clickEvent = clickEvent;
        this.properties.activeClose = activeClose;

        this.properties.items.content[DATA_TYPE.COMPONENT].string = content;
        this.properties.items.title[DATA_TYPE.COMPONENT].string   = title;
        this.properties.items.version[DATA_TYPE.COMPONENT].string = 'v' + Utils.getVersion();
        this.properties.items.close[DATA_TYPE.NODE].active        = activeClose;
        this.properties.items.confirm[DATA_TYPE.NODE].active       = (clickEvent !== null);
        this.properties.items.okLabel[DATA_TYPE.COMPONENT].string = okLabel;
       
        Utils.commonActiveUITween(this.node, true);
        Controller.MaskActive(true);
    }

    public clickConfirm(): void {
        if ( this.properties.clickEvent !== null ) {
            this.closeUI();
            this.properties.clickEvent();
        }
        
        if ( this.properties.activeClose === true ) {
            this.closeUI();
        }
    }
}

