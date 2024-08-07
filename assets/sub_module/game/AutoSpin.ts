import { _decorator, Button, Component, Node, Label } from 'cc';
import { switchButton } from '../utils/SwitchButton/switchButton';
import { LanguageLabel } from './Language/LanguageLabel';
import { dropDown } from '../utils/DropDown/dropDown';
import { Utils, DATA_TYPE } from '../utils/Utils';
import { Controller } from './machine/controller_folder/Controller';
import { Machine } from './machine/Machine';
import { SoundManager } from './machine/SoundManager';
const { ccclass, property } = _decorator;

@ccclass('AutoSpin')
export class AutoSpin extends Component {

    private readonly initData = {
        'autoSpin' : {
            'close'     : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Background/Close', [DATA_TYPE.CLICK_EVENT]: this.closeUI  },
            'start'     : { [DATA_TYPE.TYPE] : Button,        [DATA_TYPE.NODE_PATH] : 'Background/Start', [DATA_TYPE.CLICK_EVENT]: this.clickStart  },
        },
        'spinTimes'     : {
            'switch'    : { [DATA_TYPE.TYPE] : switchButton,  [DATA_TYPE.NODE_PATH] : 'Background/Spin Times/SwitchButton' },
            'label'     : { [DATA_TYPE.TYPE] : LanguageLabel, [DATA_TYPE.NODE_PATH] : 'Background/Spin Times/Label' },
            'dropdown'  : { [DATA_TYPE.TYPE] : dropDown,      [DATA_TYPE.NODE_PATH] : 'Background/Spin Times/DropDown'},
        },

        'untilFeature'  : {
            'switch'    : { [DATA_TYPE.TYPE] : switchButton,  [DATA_TYPE.NODE_PATH] : 'Background/Settings/UNTIL FEATURE/SwitchButton'},
            'label'     : { [DATA_TYPE.TYPE] : LanguageLabel, [DATA_TYPE.NODE_PATH] : 'Background/Settings/UNTIL FEATURE' },
        },

        'quickSpin'     : {
            'switch'    : { [DATA_TYPE.TYPE] : switchButton,  [DATA_TYPE.NODE_PATH] : 'Background/Settings/QUICK SPIN/SwitchButton'},
            'label'     : { [DATA_TYPE.TYPE] : LanguageLabel, [DATA_TYPE.NODE_PATH] : 'Background/Settings/QUICK SPIN' },
        },
        
        'turboSpin'     : {
            'switch'    : { [DATA_TYPE.TYPE] : switchButton,  [DATA_TYPE.NODE_PATH] : 'Background/Settings/TURBO SPIN/SwitchButton'},
            'label'     : { [DATA_TYPE.TYPE] : LanguageLabel, [DATA_TYPE.NODE_PATH] : 'Background/Settings/TURBO SPIN' },
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

    public static isActive() : boolean { return AutoSpin.Instance.active; }
    public get active() : boolean { return this.properties.autoSpin.active; }
    private set active(value:boolean) { this.properties.autoSpin.active = value; }

    public get machine() : Machine { return Machine.Instance; }

    /** 開啟 AutoSpin 後的Spin按鈕 */
    public get autoSpinButton() : Button { return this.machine.controller.autoSpinButton; }

    /** 開啟 AutoSpin 後的次數顯示 Label */
    public get autoSpinTimeLabel() : Label { return this.machine.controller.autoSpinLabel; }

    public static Instance: AutoSpin = null;
    protected onLoad(): void {
        this.node.active = false;
        this.node.setPosition(0,0,0);
        AutoSpin.Instance = this;
        this.init();
    }

    protected start(): void {
        this.properties.machine = Machine.Instance;
    }

    private init() {
        Utils.initData(this.initData, this);
    }

    public closeUI() { this.activeUI(false); }
    public async openUI() { 
        if ( this.machine.isBusy ) return;
        Utils.GoogleTag('OpenAutoSpin', {'event_category':'AutoSpin', 'event_label':'OpenAutoSpin' });
        await this.activeUI(true);
        this.changeSpeedMode(this.machine.SpeedMode); 
        this.properties['spinTimes'].switch[DATA_TYPE.COMPONENT].switch(false);
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
        SoundManager.PlayButtonSound();
    }

    public swichUntilFeature(active:boolean) {
        console.log('swichUntilFeature', active);
        SoundManager.PlayButtonSound();
    }

    public switchQuickSpin(active:boolean) {
        SoundManager.PlayButtonSound();
        if ( active === true ) return Controller.ChangeSpeedMode(Machine.SPIN_MODE.QUICK);
        if ( this.machine.SpeedMode === Machine.SPIN_MODE.QUICK ) return Controller.ChangeSpeedMode(Machine.SPIN_MODE.NORMAL);
    }

    public switchTurboSpin(active:boolean) {
        SoundManager.PlayButtonSound();
        if ( active === true ) return Controller.ChangeSpeedMode(Machine.SPIN_MODE.TURBO);
        if ( this.machine.SpeedMode === Machine.SPIN_MODE.TURBO ) return Controller.ChangeSpeedMode(Machine.SPIN_MODE.NORMAL);
    }

    public changeSpeedMode(mode:number) {
        let type = Machine.SPIN_MODE;
        switch(mode) {
            case type.QUICK:  
                this.initData.turboSpin.switch[DATA_TYPE.COMPONENT].switch(false); 
                this.initData.quickSpin.switch[DATA_TYPE.COMPONENT].switch(true);
                break;
            case type.TURBO:  
                this.initData.quickSpin.switch[DATA_TYPE.COMPONENT].switch(false);
                this.initData.turboSpin.switch[DATA_TYPE.COMPONENT].switch(true); 
                break;
            default:
                this.initData.quickSpin.switch[DATA_TYPE.COMPONENT].switch(false);
                this.initData.turboSpin.switch[DATA_TYPE.COMPONENT].switch(false);
                break;
        }
    }

    public static ChangeSpeedMode(mode:number) { AutoSpin.Instance.changeSpeedMode(mode); }

    public dropDownSpinTimes(item, itemName, idx, customData, customEventData) {
        console.log('dropDownSpinTimes', customData);
        this.initData.spinTimes.switch[DATA_TYPE.COMPONENT].switch(true);
    }

    public clickStart() {
        this.closeUI();
        if ( this.machine.isBusy ) return;

        const spinTimesData                = this.properties['spinTimes'].dropdown[DATA_TYPE.COMPONENT].getPickData();
        const spinTimeActive      :boolean = this.properties['spinTimes'].switch[DATA_TYPE.COMPONENT].Active;
        const untilFeatureActive  :boolean = this.properties['untilFeature'].switch[DATA_TYPE.COMPONENT].Active;
        const spinTimes           :number  = parseInt(spinTimesData.customData);
        const active              = (spinTimeActive || untilFeatureActive);
        
        if ( active === false ) return;
        const autoSpin = this.properties.autoSpin;
        this.active             = active;
        autoSpin.spinTimeActive = spinTimeActive;
        autoSpin.spinTimes      = spinTimes;
        autoSpin.untilFeature   = untilFeatureActive;

        Utils.GoogleTag('StartAutoSpin', {'event_category':'AutoSpin', 'event_label':'StartAutoSpin', 'value': {
            'spinTimes'      : spinTimes,
            'spinTimeActive' : +spinTimeActive,
            'untilFeature'   : +untilFeatureActive,
        }});
        this.decrementCount();
        SoundManager.PlayButtonSound();
    }

    public static IsUtilFeature() : boolean {
        if ( this.Instance.active === false ) return false;
        return this.Instance.properties.autoSpin.untilFeature;
    }

    /**
     * 是否要繼續AutoSpin
     * @returns 
     */
    public async decrementCount() : Promise<boolean> {
        if ( this.machine.isBusy ) return false;

        if ( this.active === false ) {
            this.closeAutoSpinTimes();
            return false;
        }
        
        const autoSpin = this.properties.autoSpin;

        if ( autoSpin.spinTimeActive === true ) {
            if ( autoSpin.spinTimes > 0 ) {
                autoSpin.spinTimes--;
                await this.autoSpinTimes(autoSpin.spinTimes);
                this.machine.controller.clickSpin(true);

                if ( autoSpin.spinTimes === 0 ) this.active = false;
                return true;
            } else if ( autoSpin.spinTimes === -1 ) {
                await this.autoSpinTimes(autoSpin.spinTimes);
                this.machine.controller.clickSpin(true);
                return true;
            }
        } 
        
        if ( autoSpin.untilFeature === true ) {
            await this.autoSpinTimes(autoSpin.spinTimes, true);
            this.machine.controller.clickSpin(true);
            return true;
        }

        this.stopAutoSpin();
        return false;
    }

    public async autoSpinTimes(times:number, isUntilFeature:boolean=false) {
        let spinTimeStr;
        if ( times === -1 ) spinTimeStr = '∞';
        else if ( isUntilFeature ) spinTimeStr = '';
        else spinTimeStr = times.toString();

        if ( this.autoSpinButton.node.active === true ) {
            await Utils.commonActiveUITween(this.autoSpinButton.node, false, true, 0.2);
        }

        this.autoSpinButton.node.active = true;
        this.autoSpinTimeLabel.string = spinTimeStr;
        await Utils.commonActiveUITween(this.autoSpinButton.node, true, true, 0.2);
    }

    public static async AutoSpinTimes(times:number, isUntilFeature:boolean=false) { return AutoSpin.Instance.autoSpinTimes(times, isUntilFeature); }

    public closeAutoSpinTimes() { this.autoSpinButton.node.active = false; }

    public static CloseAutoSpinTimes() { AutoSpin.Instance.closeAutoSpinTimes(); }

    /**
     * 停止AutoSpin
     * @from Controller initData['autoSpin']['button']
     */
    public static StopAutoSpin() { 
        AutoSpin.Instance.stopAutoSpin(); 
    }

    public stopAutoSpin() {
        if ( this.machine.featureGame ) return false;
        if ( this.enabled === false )   return false;

        Utils.GoogleTag('StopAutoSpin', {'event_category':'AutoSpin', 'event_label':'StopAutoSpin', 'value': {
            'spinTimes'      : this.properties.autoSpin.spinTimes,
            'spinTimeActive' : +this.properties.autoSpin.spinTimeActive,
            'untilFeature'   : +this.properties.autoSpin.untilFeature,
        }});

        this.closeAutoSpinTimes();
        this.autoSpinTimeLabel.string = '';
        this.active = false;
        return true;
    }

    public static StopSpinByUtilFeature() { return AutoSpin.Instance.stopSpinByUtilFeature(); }

    public stopSpinByUtilFeature() :boolean {
        if ( this.active !== true ) return false;
        if ( this.properties.autoSpin.untilFeature !== true ) return false;
        this.active = false;
        return true;
    }
}

