import { _decorator, Button, CCInteger, CCString, Component, EventHandler, instantiate, Label, Node, ScrollView, UITransform } from 'cc';
import { Utils } from '../Utils';
const { ccclass, property } = _decorator;

@ccclass('dropDownItem')
export class dropDownItem {
    @property({displayName:'ItemName'})
    public itemName : string = '';

    @property({type:Node, displayName:'ItemNode', tooltip:'如果沒有設定就會拿取預設Node'})
    public itemNode: Node = null;

    @property({type:Label, displayName:'ItemDisplayLabel'})
    public itemDisplayLabel : Label = null;

    @property({displayName:'customData', tooltip:'參數資料'})
    public itemCustomData : string = "";
}

@ccclass('dropDown')
export class dropDown extends Component {

    @property({ group:({ name:'ItemSetting', id:'0' }), displayName:'DefaultItem', type:dropDownItem })
    public defaultItem : dropDownItem = new dropDownItem();

    // @property({ group:({ name:'ItemSetting', id:'0' }), displayName:'SelectedItem', type:dropDownItem })
    // public selectedItem : dropDownItem = new dropDownItem();

    @property({ group:({ name:'ItemSetting', id:'0' }), displayName:'itemList', type:[dropDownItem] })
    public itemList : dropDownItem[] = [];

    @property({ group:({ name:'ItemSetting', id:'0' }), displayName:'DefaultDisplayITem', type:CCInteger })
    public defaultDisplayIdx : number = 0;

    @property({ group:({ name:'DropDownDefault', id:'1' }), displayName:'ScrollView', type:ScrollView })
    public mainScrollView : ScrollView;

    @property({ group:({ name:'DropDownDefault', id:'1' }), displayName:'DisplayItemLabel', type:Label })
    public mainDisplayItemLabel : Label;

    @property({ group:({ name:'DropDownDefault', id:'1' }), displayName:'UIMaskNode', type:UITransform })
    public mainMaskUITrans : UITransform;

    @property({displayName:'Display amount:', type:CCInteger, min:-1, max:100, step:1  })
    public mainDisplayAmount:number = 5;

    @property({ displayName:'EventHandler', type:[EventHandler] })
    public callEventHandler: EventHandler[] = [];

    protected items = null;

    protected onLoad(): void {
        console.log('onLoad:', this.itemList);
        this.mainDisplayItemLabel.node.on(Node.EventType.TOUCH_END, this.click, this);
        this.mainScrollView.node.active = false;
        this.defaultItem.itemNode.active = false;
        if ( this.mainMaskUITrans != null ) this.mainMaskUITrans.node.active = false;
        this.createItem();
    }

    public start() { 
        this.pickDefault(); 
    }

    protected maskClose() { this.open(false); }

    protected click() { this.open(!this.mainScrollView.node.active); }

    protected open(active:boolean) {
        if ( active === true ) {
            this.mainScrollView.node.active = true;
            this.addMaskClickEvent(true);
        } else {
            this.addMaskClickEvent(false);
            this.mainScrollView.node.active = false;
        }
    }

    protected addMaskClickEvent(active:boolean) {
        if ( this.mainMaskUITrans == null ) return;
        if ( active === false ) return this.mainMaskUITrans.node.active = false;

        let button : Button = this.mainMaskUITrans.node.getComponent(Button);
        if ( button == null ) button = this.mainMaskUITrans.node.addComponent(Button);

        let event = new EventHandler();
        event.target = this.node;
        event.component = 'dropDown';
        event.handler = 'maskClose';
        
        if ( button.clickEvents.length === 0) {
            button.clickEvents = [ event ];
        } else {
            button.clickEvents[0] = event;
        }
        this.mainMaskUITrans.node.active = true;
    }

    protected clearItem() {
        let childs = this.mainScrollView.content.children;
        if ( childs.length === 0 ) return;

        for(let i=childs.length-1;i>=0;i--) {
            let child: Node = childs[i];
            child.active = false;
            child.destroy();
        }
    }

    protected createItem() {
        console.log('createItem: step 1', this.itemList);
        if ( this.itemList == null ) return;

        console.log('createItem: step 2' );
        if ( this.itemList.length === 0 ) return;

        console.log('createItem: step 3' );
        let container = this.mainScrollView.content;
        let defaultIndx = this.defaultDisplayIdx;
        this.items = {'pickIdx':defaultIndx};

        console.log('createItem: step 4' );
        for(let i in this.itemList) {
            let item = this.itemList[i];
            let itemNode : Node;
            let idx = parseInt(i);

            console.log('createItem: step 5', item );
            if ( item.itemNode != null ) {
                console.log('createItem: step 5-1');
                item.itemNode.active = false;
                item.itemDisplayLabel.string = item.itemName;
                itemNode = instantiate(item.itemNode);

            } else {
                console.log('createItem: step 5-2');
                this.defaultItem.itemDisplayLabel.string = item.itemName;
                itemNode = instantiate(this.defaultItem.itemNode);
            }
            
            itemNode.on(Node.EventType.TOUCH_END, (event:Event)=>{ return this.pickItem(event, itemNode, item.itemName, idx); } );
            this.items[idx] = { 'node':itemNode, 'data':item, 'idx':idx, 'customData':item.itemCustomData };
            /*if ( idx === defaultIndx ) {
                this.pickItem(null, itemNode, item.itemName, idx);
            }*/
            container.addChild(itemNode);
            let pos = itemNode.getPosition();
            itemNode.setPosition(0, pos.y, 0);
            itemNode.active = true;
        }
        this.calculateScrollViewHeight();
    }

    protected pickDefault() { 
        console.log('pickDefault:', this.items);
        let index = this.items.pickIdx;
        let itemNode = this.items[index]['node'];
        let itemName = this.items[index]['data'].itemName;
        return this.pickItem(null,itemNode, itemName, index); 
    }

    protected calculateScrollViewHeight() {
        let itemHeight = this.defaultItem.itemNode.getComponent(UITransform).contentSize.height;
        let displayAmount = this.mainDisplayAmount;
        if ( displayAmount === -1 ) displayAmount = this.itemList.length;
        let totalHeight = itemHeight * displayAmount;
        let uiTrans = this.mainScrollView.getComponent(UITransform);
        let conSize = uiTrans.contentSize;
        console.log('conSize:', conSize.width, totalHeight);
        uiTrans.setContentSize(conSize.width, totalHeight);
    }

    protected pickItem(event:Event, item:Node, itemName:string, idx:number) {
        this.mainDisplayItemLabel.string = itemName;
        this.items.pickIdx = idx;
        let itemData = this.items[idx];
        if ( event != null ) this.open(false);

        for(let i in this.callEventHandler) {
            let evt = this.callEventHandler[i];
            if ( evt == null) continue;
            evt.emit([ item, itemName, idx, itemData.customData, evt.customEventData ]);
        }
    }

    public getPickData() { return this.items[this.items.pickIdx]; }
}

