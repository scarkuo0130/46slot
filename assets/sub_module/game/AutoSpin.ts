import { _decorator, Button, Component, Node, EventHandler } from 'cc';
import { switchButton } from '../utils/SwitchButton/switchButton';
import { LanguageLabel } from './Language/LanguageLabel';
import { dropDown } from '../utils/DropDown/dropDown';
import { Utils, DATE_TYPE } from '../utils/Utils';
import { Controller } from './machine/controller_folder/Controller';
import { Machine } from './machine/Machine';
const { ccclass, property } = _decorator;

@ccclass('AutoSpin')
export class AutoSpin extends Component {

    private readonly initData = {
        'autoSpin' : {
            'close'     : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Background/Close', [DATE_TYPE.CLICK_EVENT]: this.closeUI  },
            'start'     : { [DATE_TYPE.TYPE] : Button,        [DATE_TYPE.NODE_PATH] : 'Background/Start', [DATE_TYPE.CLICK_EVENT]: this.clickStart  },
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
        'autoSpin' :{
            active          : false,  // 目前是否開啟
            spinTimeActive  : false,  // 是否開啟spinTime
            spinTimes       : 0,      // 目前的剩餘次數
            untilFeature    : false,  // 是否開啟直到特定feature
        }
    };

    public get machine() :Machine { return this.properties.machine; }

    public static Instance: AutoSpin = null;
    protected onLoad(): void {
        this.node.active = false;
        this.node.setPosition(0,0,0);
        AutoSpin.Instance = this;
        this.init();
        this.properties.machine = Machine.Instance;
    }

    private init() {
        Utils.initData(this.initData, this);
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
        Controller.MaskActive(active);
        return await Utils.commonActiveUITween(this.node, active);
    }

    public switchSpinTimes(active:boolean) {
        console.log('switchSpinTimes', active);
    }

    public swichUntilFeature(active:boolean) {
        console.log('swichUntilFeature', active);
    }

    public switchQuickSpin(active:boolean) {
        if ( active === true ) return Controller.ChangeSpeedMode(Machine.SPEED_MODE.QUICK);
        if ( this.machine.SpeedMode === Machine.SPEED_MODE.QUICK ) return Controller.ChangeSpeedMode(Machine.SPEED_MODE.NORMAL);
    }

    public switchTurboSpin(active:boolean) {
        if ( active === true ) return Controller.ChangeSpeedMode(Machine.SPEED_MODE.TURBO);
        if ( this.machine.SpeedMode === Machine.SPEED_MODE.TURBO ) return Controller.ChangeSpeedMode(Machine.SPEED_MODE.NORMAL);
    }

    public changeSpeedMode(mode:number) {
        let type = Machine.SPEED_MODE;
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

        let spinTimesData                = this.initData.spinTimes.dropdown[DATE_TYPE.COMPONENT].getPickData();
        let spinTimeActive      :boolean = this.initData.spinTimes.switch[DATE_TYPE.COMPONENT].Active;
        let untilFeatureActive  :boolean = this.initData.untilFeature.switch[DATE_TYPE.COMPONENT].Active;
        let spinTimes           :number  = parseInt(spinTimesData.customData);
        let active              = (spinTimeActive || untilFeatureActive);
        
        if ( active === false ) return;
        let autoSpin = this.properties.autoSpin;
        autoSpin.active         = active;
        autoSpin.spinTimeActive = spinTimeActive;
        autoSpin.spinTimes      = spinTimes;
        autoSpin.untilFeature   = untilFeatureActive;

        this.machine.startAutoSpin();
    }
}

