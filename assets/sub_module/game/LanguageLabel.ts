import { _decorator, Component, Label } from 'cc';
import { i18n } from '../utils/i18n';
const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('LanguageLabel')
@menu('SlotMachine/i18n/LanguageLabel')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.xpevc16ykigp')
export class LanguageLabel extends Label {
    @property({ displayName:'LanguageKey' })
    public key = 'game';
    
    @property({displayName:'LanguageID' })
    public languageID = 0;

    start() {
        if ( this.key == null || this.key.length == 0 ) return;

        let content = i18n.getContent(this.key, this.languageID);
        if ( content == null || content.length == 0 ) return;

        this.string = content;
    }

}

