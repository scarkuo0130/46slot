import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { i18n } from '../../utils/i18n';

const { ccclass, property, menu, help, disallowMultiple } = _decorator;

@ccclass('LanguageSpriteData')
export class LanguageSpriteData {
    @property({ displayName: 'LanguageType', tooltip: '語言代號' })
    language: string = "en";

    @property({ type: SpriteFrame, displayName: 'SpriteFrame', tooltip: '使用圖片' })
    sprite: SpriteFrame;
}


@ccclass('LanguageSprite')
@menu('SlotMachine/i18n/LanguageSprite')
@help('https://docs.google.com/document/d/1dphr3ShXfiQeFBN_UhPWQ2qZvvQtS38hXS8EIeAwM-Q/edit#heading=h.cgwpsomsga')
export class LanguageSprite extends Sprite {
    @property({ type: [LanguageSpriteData], displayName: 'LanguageSpriteData' })
    public languageSpriteData: LanguageSpriteData[] = [];

    public lanData = {};

    onLoad(): void {
        this.init();
        super.onLoad();
    }

    init() {
        if (this.languageSpriteData.length === 0) return;
        this.lanData = {};

        for (let i in this.languageSpriteData) {
            let data = this.languageSpriteData[i];
            if (data == null) continue;
            if (data.language === "") continue;
            if (data.sprite == null) continue;

            this.lanData[data.language] = data.sprite;
        }
    }

    protected changeSprite() {
        let lang = i18n.getLanguage();
        if (this.lanData[lang] == null) return;
        this.spriteFrame = this.lanData[lang];
    }

    start(): void {
        this.changeSprite();
        //super.start();
    }
}

