import { _decorator, assetManager, Component, JsonAsset, Node, resources } from 'cc';
import { Utils } from './Utils';
import { HTTP_METHODS, HttpRequestUtils } from '../network/HttpRequestUtils';
import { IResponseData } from '../network/NetworkManager';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('i18nLanguageData')
export class i18nLanguageData {
    @property({ displayName:'ID' })
    public id = '';

    @property({ type:JsonAsset, displayName:'JsonFile'})
    public jsonFile : JsonAsset;

}

@ccclass('i18n')
@disallowMultiple(true)
@menu('SlotMachine/i18n/i18n')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.dwwq3zul0c5a')
export class i18n extends Component {
    public static instance : i18n;

    public static language : {};

    public static languageType :string = 'en';

    public static getLanguage() { return i18n.languageType; }

    public static setLanguage(value:string) { i18n.languageType = value; }


    @property({type:[i18nLanguageData], displayName:'JsonDataList', group:{name:'setting'} })
    public languageData : i18nLanguageData[] = [];

    public onLoad() { 
        i18n.instance = this; 
        this.loadLanguage();
    }

    public loadLanguage() {
        i18n.language = {};
        for(let idx in this.languageData) {
            let data = this.languageData[idx];

            if ( data.id.length === 0 ) continue;
            if ( data.jsonFile == null ) continue;
            if ( i18n.language[data.id] != null ) continue;
            this.parseLanguage(data.id, data.jsonFile);
        }
    }

    public parseLanguage(type, data) {
        if ( i18n.language[type] == null ) i18n.language[type] = {};
        let lanKeys = Object.keys(data.json);
        for(let i in lanKeys) {
            let lan = lanKeys[i];
            let ids = Object.keys(data.json[lan]);
            if ( i18n.language[type][lan] == null ) i18n.language[type][lan] = {};
            for(let j in ids) {
                let id = ids[j];
                let no = parseInt(ids[j]);
                i18n.language[type][lan][no] = data.json[lan][id];
            }
        }
    }

    public static getContent(key:string, id:number) : string {
        if ( !key || key.length == 0 ) return null;
        if ( id === 0 ) return null;
        if ( i18n.language == null ) return null;
        if ( i18n.language[key] == null ) return null;

        let type = i18n.languageType;
        if ( i18n.language[key][type] == null ) type = 'en';

        return i18n.language[key][type][id];
    }

    public static init(language:string) {
       i18n.languageType = language;
    }
}
