import { _decorator, Component, Node, Toggle } from 'cc';
import { SimbpleAudioClipData, SoundManager } from './SoundManager';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('InfomationUI')
@disallowMultiple(true)
@menu('SlotMachine/Controller/InfomationUI')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.k32cwajhiauk')
export class InfomationUI extends Component {

    @property({type:Node, displayName:'Page1', group:{name:'PageSetting', id:'0'} })
    public pageNode1:Node;

    @property({type:Node, displayName:'Page2', group:{name:'PageSetting', id:'0'} })
    public pageNode2:Node;

    @property({type:Node, displayName:'Page3', group:{name:'PageSetting', id:'0'} })
    public pageNode3:Node;

    @property({type:Toggle, displayName:'Toggle1', group:{name:'ToggleSetting', id:'1'} })
    public toggle1:Toggle;

    @property({type:Toggle, displayName:'Toggle2', group:{name:'ToggleSetting', id:'1'} })
    public toggle2:Toggle;

    @property({type:Toggle, displayName:'Toggle3', group:{name:'ToggleSetting', id:'1'} })
    public toggle3:Toggle;

    @property({type:SimbpleAudioClipData})
    public pressBtnAudio;

    public pageData = {};

    onLoad() {
        this.pageData = {};
        this.pageData[0] = [this.toggle1, this.pageNode1];
        this.pageData[1] = [this.toggle2, this.pageNode2];
        this.pageData[2] = [this.toggle3, this.pageNode3];
        this.pageData['lastPage'] = 0;

        this.openPage(0);
        this.closePage(1);
        this.closePage(2);
    }

    closePage(idx:number) {
        SoundManager.playSoundData(this.pressBtnAudio);
        this.pageData[idx][1].active = false;
        this.pageData[idx][0].isChecked = false;
    }
    
    openPage(idx:number) {
        this.pageData[idx][1].active = true;
        this.pageData[idx][0].isChecked = true;
        this.pageData['lastPage'] = idx;
    }

    changePage(evt:any, value) {
        SoundManager.playSoundData(this.pressBtnAudio);
        let idx = parseInt(value);
        if ( idx === this.pageData['lastPage'] ) return;
        this.closePage(this.pageData['lastPage']);
        this.openPage(idx);
    }

    pageUp(evt:any, value) {
        let lastPage = this.pageData['lastPage'];
        this.closePage(lastPage);

        let nowPage = lastPage + parseInt(value);
        if ( nowPage < 0 ) nowPage = 2;
        else if ( nowPage > 2 ) nowPage = 0;

        this.openPage(nowPage);
    }
}



