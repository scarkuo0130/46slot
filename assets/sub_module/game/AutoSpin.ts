import { _decorator, Button, Component, Node, EventHandler } from 'cc';
import { switchButton } from '../utils/SwitchButton/switchButton';
import { LanguageLabel } from './Language/LanguageLabel';
import { dropDown } from '../utils/DropDown/dropDown';
import { Utils } from '../utils/Utils';
import { Controller2_0 } from './machine/controller_folder/Controller2.0';
import { Machine } from 'xstate';
import { Machine2_0 } from './machine/Machine2.0';
const { ccclass, property } = _decorator;

export enum DATE_TYPE {
    NODE = 0, // object node
    COMPONENT = 1, // object component
    TYPE = 2, // object component type
    NODE_PATH = 3, // node path for init object
    CLICK_EVENT = 4, // click event
}

@ccclass('AutoSpin')
export class AutoSpin extends Component {

    private readonly initData = {
        'autoSpin' : {
            'close' : { [DATE_TYPE.TYPE]: Button, [DATE_TYPE.NODE_PATH] : 'Background/Close', [DATE_TYPE.CLICK_EVENT]: this.closeUI  },
            'start' : { [DATE_TYPE.TYPE]: Button, [DATE_TYPE.NODE_PATH] : 'Background/Start', [DATE_TYPE.CLICK_EVENT]: this.clickStart  },
        },
        'spinTimes'     : {
            'switch'    : { [DATE_TYPE.TYPE] : switchButton,  [DATE_TYPE.NODE_PATH] : 'Background/Spin Times/SwitchButton' },
            'label'     : { [DATE_TYPE.TYPE] : LanguageLabel, [DATE_TYPE.NODE_PATH] : 'Background/Spin Times/Label' },
            'dropdown'  : { [DATE_TYPE.TYPE] : dropDown,      [DATE_TYPE.NODE_PATH] : 'Background/Spin Times/DropDown'},
        },

        'untilFeature'  : {
            'switch'    : { [DATE_TYPE.TYPE] : switchButton,  [DATE_TYPE.NODE_PATH] : 'Background/Settings/UNTIL FEATURE/SwitchButton'},
            'label'     : { [DATE_TYPE.TYPE] : LanguageLabel, [DATE_TYPE.NODE_PATH] : 'Background/Settings/UNTIL FEATURE' },
        },

        'quickSpin'     : {
            'switch'    : { [DATE_TYPE.TYPE] : switchButton,  [DATE_TYPE.NODE_PATH] : 'Background/Settings/QUICK SPIN/SwitchButton'},
            'label'     : { [DATE_TYPE.TYPE] : LanguageLabel, [DATE_TYPE.NODE_PATH] : 'Background/Settings/QUICK SPIN' },
        },
        
        'turboSpin'     : {
            'switch'    : { [DATE_TYPE.TYPE] : switchButton,  [DATE_TYPE.NODE_PATH] : 'Background/Settings/TURBO SPIN/SwitchButton'},
            'label'     : { [DATE_TYPE.TYPE] : LanguageLabel, [DATE_TYPE.NODE_PATH] : 'Background/Settings/TURBO SPIN' },
        },
    };

    private properties = {
        'machine' : null,
    };

    public get machine() { return this.properties.machine; }

    public static Instance: AutoSpin = null;
    protected onLoad(): void {
        AutoSpin.Instance = this;
        this.init();
    }

    private init() {
        this.node.active = false;
        this.node.setPosition(0,0,0);
        this.properties = JSON.parse(JSON.stringify(this.initData));
        this.properties.machine = Machine2_0.Instance;
        let properties = this.initData;
        
        for(let i=0;i<Object.keys(properties).length;i++) {

            let key = Object.keys(properties)[i];
            let property = properties[key];

            for(let j=0;j<Object.keys(property).length;j++) {
                let subKey = Object.keys(property)[j];
                let subProperty = property[subKey];

                if ( subKey === 'INIT_EVENT' ) {
                    let boundSubProperty = subProperty.bind(this);
                    boundSubProperty(property);
                    continue;
                }


                console.log('subProperty',subKey, typeof(subProperty), property);
                let path = subProperty[DATE_TYPE.NODE_PATH];
                if ( path == null || typeof(path) !== 'string' ) continue;

                subProperty[DATE_TYPE.NODE] = this.node.getChildByPath(subProperty[DATE_TYPE.NODE_PATH]);
                if ( subProperty[DATE_TYPE.NODE] == null ) {
                    console.error('AutoSpin: Node not found: ' + subProperty[DATE_TYPE.NODE_PATH]);
                    continue;
                }
                subProperty[DATE_TYPE.COMPONENT] = subProperty[DATE_TYPE.NODE].getComponent(subProperty[DATE_TYPE.TYPE]);
                if ( subProperty[DATE_TYPE.COMPONENT] == null ) {
                    console.error('AutoSpin: Component not found: ' + subProperty[DATE_TYPE.TYPE]);
                    continue;
                }

                if ( subProperty[DATE_TYPE.CLICK_EVENT] != null ) {
                    subProperty[DATE_TYPE.NODE].on(Node.EventType.TOUCH_END, subProperty[DATE_TYPE.CLICK_EVENT], this);
                    Utils.AddHandHoverEvent(subProperty[DATE_TYPE.NODE]);
                }
            }

            this.properties[key] = property;
        }
    }


    public closeUI() { this.activeUI(false); }
    public async openUI() { 
        await this.activeUI(true);
        this.changeSpeedMode(this.machine.SpeedMode); 
    }
    public static OpenUI() { AutoSpin.Instance.openUI(); }
    public static CloseUI() { AutoSpin.Instance.closeUI(); }

    public async activeUI(active:boolean) {
        if ( this.node.active === active ) return;
        Controller2_0.MaskActive(active);
        return await Utils.commonActiveUITween(this.node, active);
    }

    public switchSpinTimes(active:boolean) {
        console.log('switchSpinTimes', active);
    }

    public swichUntilFeature(active:boolean) {
        console.log('swichUntilFeature', active);
    }

    public switchQuickSpin(active:boolean) {
        if ( active === true ) return Controller2_0.ChangeSpeedMode(Machine2_0.SPEED_MODE.QUICK);
        if ( this.machine.SpeedMode === Machine2_0.SPEED_MODE.QUICK ) return Controller2_0.ChangeSpeedMode(Machine2_0.SPEED_MODE.NORMAL);
    }

    public switchTurboSpin(active:boolean) {
        if ( active === true ) return Controller2_0.ChangeSpeedMode(Machine2_0.SPEED_MODE.TURBO);
        if ( this.machine.SpeedMode === Machine2_0.SPEED_MODE.TURBO ) return Controller2_0.ChangeSpeedMode(Machine2_0.SPEED_MODE.NORMAL);
    }

    public changeSpeedMode(mode:number) {
        let type = Machine2_0.SPEED_MODE;
        switch(mode) {
            case type.QUICK:  
                this.initData.turboSpin.switch[DATE_TYPE.COMPONENT].switch(false); 
                this.initData.quickSpin.switch[DATE_TYPE.COMPONENT].switch(true);
                break;
            case type.TURBO:  
                this.initData.quickSpin.switch[DATE_TYPE.COMPONENT].switch(false);
                this.initData.turboSpin.switch[DATE_TYPE.COMPONENT].switch(true); 
                break;
            default:
                this.initData.quickSpin.switch[DATE_TYPE.COMPONENT].switch(false);
                this.initData.turboSpin.switch[DATE_TYPE.COMPONENT].switch(false);
                break;
        }
    }

    public static ChangeSpeedMode(mode:number) { AutoSpin.Instance.changeSpeedMode(mode); }

    public dropDownSpinTimes(item, itemName, idx, customData, customEventData) {
        console.log('dropDownSpinTimes', customData);
        this.initData.spinTimes.switch[DATE_TYPE.COMPONENT].switch(true);
    }

    public clickStart() {
        console.log('clickStart');
        this.closeUI();
    }
}

