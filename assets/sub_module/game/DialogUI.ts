import { _decorator, Component, Node, Button, Label } from 'cc';
import { Utils, DATE_TYPE } from '../utils/Utils';
import { Controller } from './machine/controller_folder/Controller';
const { ccclass, property } = _decorator;

@ccclass('DialogUI')
export class DialogUI extends Component {
    private initData = {
        'items' : {
            'close'   : { [DATE_TYPE.TYPE] : Button, [DATE_TYPE.NODE_PATH] : 'Background/Close',        [DATE_TYPE.CLICK_EVENT]: this.closeUI  },
            'title'   : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'Background/Title',        [DATE_TYPE.CLICK_EVENT]: null  },
            'content' : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'Background/Content',      [DATE_TYPE.CLICK_EVENT]: null },
            'confirm'  : { [DATE_TYPE.TYPE] : Button, [DATE_TYPE.NODE_PATH] : 'Background/Confirm',       [DATE_TYPE.CLICK_EVENT]: this.clickConfirm  },
            'version' : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'Background/Version',      [DATE_TYPE.CLICK_EVENT]: null },
            'okLabel' : { [DATE_TYPE.TYPE] : Label,  [DATE_TYPE.NODE_PATH] : 'Background/Confirm/Label', [DATE_TYPE.CLICK_EVENT]: null },
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


    private init(): void {
        DialogUI.Instance = this;
        this.node.active = false;
        this.node.setPosition(0,0,0);
        Utils.initData(this.initData, this);
    }

    private closeUI(): void {
        Utils.commonActiveUITween(this.node, false);
        Controller.MaskActive(false);
    }

    public static OpenUI(content:string, activeClose=false, title:string='', clickEvent:Function=null, okLabel:string='ok'): void { return DialogUI.Instance.openUI(content, activeClose, title, clickEvent, okLabel); }
    public openUI(content:string, activeClose=false, title:string='', clickEvent:Function=null, okLabel:string='ok'): void {
        this.properties.clickEvent = clickEvent;
        this.properties.activeClose = activeClose;

        this.properties.items.content[DATE_TYPE.COMPONENT].string = content;
        this.properties.items.title[DATE_TYPE.COMPONENT].string   = title;
        this.properties.items.version[DATE_TYPE.COMPONENT].string = 'v' + Utils.getVersion();
        this.properties.items.close[DATE_TYPE.NODE].active        = activeClose;
        this.properties.items.confirm[DATE_TYPE.NODE].active       = (clickEvent !== null);
        this.properties.items.okLabel[DATE_TYPE.COMPONENT].string = okLabel;
       
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

