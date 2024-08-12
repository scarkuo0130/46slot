import { VIEW_CONFIG } from './config';
import { InGameInformation } from '../ingamemenu/InGameInformation';
//import $ from 'jquery'
export class InGameMenuContent {
    ratio = 16 / 9;
    urlLanguage = 'en';
    gameInstance;
    constructor ( parent ) {
        this.gameInstance = parent;
        // * This is a flag for quick off confirm window
        this.IS_NEED_CONFIRM = true;

        this.POPUP_WIDTH = 890;
        this.POPUP_HEIGHT = 1660;

        this.$inGameMenuPopupWindow = undefined;
        this.$inGameMenu = undefined;
        this.$closeButton = undefined;

        this.$confirmContainer = undefined;
        this.$confirmWindow = undefined;

        this.hasInit = false;
        this.isPortrait = true/*window.innerHeight > window.innerWidth || !ORIENTATION_CONFIG[ gameInformation.gameid ].LANDSCAPE*/;
        this.isFavIndex = false;

        this.selectedGameId = 0;

        this.isNeedToUpdate = false;
        this.setDisplayLanguage();
    }

    setDisplayLanguage () {
        let confirmMsg = {
            'en': 'Leave this game and switch to ',
            'zh-cn': '离开当前游戏并前往',
            'ko': '플레이',
            'id': 'Tinggalkan game ini dan beralih ke ',
            'vi': 'rời khỏi trò chơi này và chuyển sang ',
            'th': 'ออกจากเกมนี้และเปลี่ยนเป็น ',
            'ms': 'Tinggalkan permainan ini dan beralih kepada ',
            'ph': 'Iwanan ang larong ito at lumipat sa ',
        };

        //let language = extensions.getParameter('lang');
        let language = this.urlLanguage;
        this.displayLanguage = ( confirmMsg[ language ] ) ? language : 'en';

        this.confirmMessage = confirmMsg[ this.displayLanguage ];
    }

    init () {
        let url = './inGameMenu.html';
        fetch( url ).then( response => response.text() ).then( ( result ) => {
            this.$inGameMenuPopupWindow = $( '<div class="popup-window"></div>' );
            this.$inGameMenu = $( '<div class="ingamemenu"></div>' );

            this.$inGameMenu.append( result );

            this.$inGameMenuPopupWindow.append( this.$inGameMenu );

            // * Find the element id `inGameMenuContent` in index.html page
            $( '#inGameMenuContent' ).prepend( this.$inGameMenuPopupWindow );

            this.$inGameMenuContent = $( '<div class="ingamemenu-content"></div>' );

            this.$background = $( `<div class="igm-background igm_bg_ver sprite-ingamemenu"></div>` );
            this.$inGameMenuContent.append( this.$background );

            this.$gameListButton = $( `<div id="allButton" class="igm-button-game-list igm_popular_${ this.displayLanguage }_0 sprite-ingamemenu" style="cursor:pointer"></div>` );
            this.$inGameMenuContent.append( this.$gameListButton );
            this.$favListButton = $( `<div id="favButton" class="igm-button-fav-list igm_favorite_${ this.displayLanguage }_0 sprite-ingamemenu" style="cursor:pointer"></div>` );
            this.$inGameMenuContent.append( this.$favListButton );

            $( '.igm-main-container' ).append( this.$inGameMenuContent );
            this.$containerFluid = $( '<div class="container-fluid-gamelist"></div>' );
            this.$inGameMenuContent.append( this.$containerFluid );

            let gameList = InGameInformation.instance.inGameMenuConfig.gameList;
            for ( let i = 0; i < gameList.length; i++ ) {
                this.$containerFluid.append( this.getImageElement( gameList[ i ] ) );
            }

            // * Add close button
            this.$closeButton = $( '<div class="igm-button-close"></div>' );
            this.$inGameMenuContent.append( this.$closeButton );
            let $closeImage = $( '<div id="closeButton" class="igm_close sprite-ingamemenu" style="cursor:pointer"></div>' );
            this.$closeButton.append( $closeImage );

            this.isNeedToUpdate = false;

            this.addListener();
            this.refreshTab();

            this.setCss();
        } );
    }

    refreshTab () {
        if ( this.isFavIndex ) {
            this.$gameListButton.removeClass( `igm_popular_${ this.displayLanguage }_0` );
            this.$gameListButton.addClass( `igm_popular_${ this.displayLanguage }_1` );
            this.$favListButton.removeClass( `igm_favorite_${ this.displayLanguage }_1` );
            this.$favListButton.addClass( `igm_favorite_${ this.displayLanguage }_0` );

            this.$gameListButton.css( 'z-index', 99 );
            this.$favListButton.css( 'z-index', 100 );

            if ( this.isPortrait ) {
                this.$gameListButton.css( 'top', '95px' );
                this.$gameListButton.css( 'left', '14px' );
                this.$favListButton.css( 'top', '90px' );
                this.$favListButton.css( 'left', '224px' );
            } else {
                this.$gameListButton.css( 'top', '27px' );
                this.$gameListButton.css( 'left', '14px' );
                this.$favListButton.css( 'top', '22px' );
                this.$favListButton.css( 'left', '224px' );
            }

            this.$containerFluid.empty();
            let gameList = InGameInformation.instance.inGameMenuConfig.favList;
            for ( let i = 0; i < gameList.length; i++ ) {
                this.$containerFluid.append( this.getImageElement( gameList[ i ] ) );
            }

        } else {
            this.$gameListButton.removeClass( `igm_popular_${ this.displayLanguage }_1` );
            this.$gameListButton.addClass( `igm_popular_${ this.displayLanguage }_0` );
            this.$favListButton.removeClass( `igm_favorite_${ this.displayLanguage }_0` );
            this.$favListButton.addClass( `igm_favorite_${ this.displayLanguage }_1` );

            this.$gameListButton.css( 'z-index', 100 );
            this.$favListButton.css( 'z-index', 99 );

            if ( this.isPortrait ) {
                this.$gameListButton.css( 'top', '90px' );
                this.$gameListButton.css( 'left', '14px' );
                this.$favListButton.css( 'top', '95px' );
                this.$favListButton.css( 'left', '208px' );
            } else {
                this.$gameListButton.css( 'top', '22px' );
                this.$gameListButton.css( 'left', '14px' );
                this.$favListButton.css( 'top', '27px' );
                this.$favListButton.css( 'left', '208px' );
            }

            this.$containerFluid.empty();
            let gameList = InGameInformation.instance.inGameMenuConfig.gameList;
            for ( let i = 0; i < gameList.length; i++ ) {
                this.$containerFluid.append( this.getImageElement( gameList[ i ] ) );
            }
        }
    }

    refreshItem ( gameId ) {
        if ( InGameInformation.instance.inGameMenuConfig.favList.includes( gameId ) ) {
            $( `#add-${ gameId }` ).removeClass( 'igm_favorite_but_1' );
            $( `#add-${ gameId }` ).addClass( `igm_favorite_but_0` );
        } else {
            $( `#add-${ gameId }` ).removeClass( 'igm_favorite_but_0' );
            $( `#add-${ gameId }` ).addClass( `igm_favorite_but_1` );
        }
    }

    getImageElement ( gameId ) {
        let isFav = InGameInformation.instance.inGameMenuConfig.favList.includes( gameId );
        let isNew = InGameInformation.instance.inGameMenuConfig.new.includes( gameId );
        let isHot = InGameInformation.instance.inGameMenuConfig.hot.includes( gameId );

        // * Create a container for Game Item
        let $gameIconContainer = $( '<div class="igm-game-icon-container"></div>' );

        // * Add board image
        let $boardDiv = $( '<div class="igm_icon_board sprite-ingamemenu"></div>' );

        // * Add Game Icon by different language
        let language = ( this.displayLanguage === 'zh-cn' ) ? 'zh_cn' : this.displayLanguage;
        let imageURl = `${ InGameInformation.instance.inGameMenuConfig.imageURL }${ language }/${ gameId }.png`;
        let $imageElement = $( `<img id="open-${ gameId }" draggable="false" class="igm-game-icon" src="${ imageURl }" />` );

        // * Add hot or new or not
        let labelName = isNew ? 'igm_new' : 'igm_hot';
        let $label = $( `<div id="gameLabel-${ gameId }" class="igm-new-hot-label ${ labelName } sprite-ingamemenu"></div>` );
        if ( isNew || isHot ) {
            $label.css( { 'visibility': 'visible' } );
        } else {
            $label.css( { 'visibility': 'hidden' } );
        }

        // * Add favorite button
        let favName = isFav ? 'igm_favorite_but_0' : 'igm_favorite_but_1';
        let $favIcon = $( `<div id="add-${ gameId }" class="igm-collect-icon ${ favName } sprite-ingamemenu"></div>` );

        // * Add Listeners
        $imageElement.on( 'click', this.touchEventHandler.bind( this ) );
        $favIcon.on( 'click', this.touchEventHandler.bind( this ) );

        // * Append all elements to container
        $gameIconContainer.append( $boardDiv );
        $gameIconContainer.append( $imageElement );
        $gameIconContainer.append( $label );
        $gameIconContainer.append( $favIcon );

        return $gameIconContainer;
    }

    createInGameMenu () {
        this.init();
    }

    addListener () {
        this.$closeButton.on( 'click', this.touchEventHandler.bind( this ) );
        this.$gameListButton.on( 'click', this.touchEventHandler.bind( this ) );
        this.$favListButton.on( 'click', this.touchEventHandler.bind( this ) );
        this.$inGameMenuContent.on( 'click', ( event ) => event.stopPropagation() );
    }

    touchEventHandler ( event ) {
        let targetId = event.target.id;
        if ( targetId.startsWith( 'add' ) ) {
            let gameId = targetId.split( '-' )[ 1 ];
            this.addToFavorite( gameId );
        } else if ( targetId.startsWith( 'open' ) ) {
            let gameId = targetId.split( '-' )[ 1 ];
            this.showConfirmDialog( gameId );
        } else if ( targetId === 'closeButton' ) {
            this.requestToCloseWindow();
        } else if ( targetId.startsWith( 'confirm' ) ) {
            let command = targetId.split( '-' )[ 1 ];
            if ( command === 'yes' ) {
                this.requestToOpenNewGame( this.selectedGameId );
            } else if ( command === 'no' ) {
                this.$confirmWindow.remove();
            }
        } else {
            if ( targetId === 'favButton' ) {
                if ( this.isFavIndex !== true ) {
                    this.isFavIndex = true;
                }
            } else if ( targetId === 'allButton' ) {
                if ( this.isFavIndex !== false ) {
                    this.isFavIndex = false;
                }
            }
            this.refreshTab();
        }
    }

    addToFavorite ( gameId ) {
        let gameIdNum = parseInt( gameId );
        if ( InGameInformation.instance.inGameMenuConfig.favList.includes( gameIdNum ) ) {
            this.removeItem( InGameInformation.instance.inGameMenuConfig.favList, gameIdNum );
        } else {
            InGameInformation.instance.inGameMenuConfig.favList.push( gameIdNum );
            InGameInformation.instance.inGameMenuConfig.favList.sort( ( a, b ) => b - a );
        }
        this.isNeedToUpdate = true;
        this.refreshItem( gameIdNum );
    }

    createConfirmWindow () {
        this.$confirmContainer = $( `<div class="confirmContainer"></div>` );

        this.$confirmWindow = $( '<div class="confirmWindow"></div>' );
        this.$confirmWindow.append( this.$confirmContainer );
        let $background = $( `<div class="igm_check_bg sprite-ingamemenu"></div>` );
        this.$confirmContainer.append( $background );

        $( '#inGameMenuContent' ).prepend( this.$confirmWindow );

        let displayText = `${ this.confirmMessage } "${ this.getGameName() }"?`;
        this.$confirmText = $( `<div class="confirmText disable-select">${ displayText }</div>` );
        this.$confirmContainer.append( this.$confirmText );

        this.$confirmYesButton = $( `<div id="confirm-yes" class="confirmYesButton igm_confirm_${ this.displayLanguage } sprite-ingamemenu" style="cursor:pointer"></div>` );
        this.$confirmContainer.append( this.$confirmYesButton );
        this.$confirmYesButton.on( 'click', this.touchEventHandler.bind( this ) );

        this.$confirmNoButton = $( `<div id="confirm-no" class="confirmNoButton igm_cancel_${ this.displayLanguage } sprite-ingamemenu" style="cursor:pointer"></div>` );
        this.$confirmContainer.append( this.$confirmNoButton );
        this.$confirmNoButton.on( 'click', this.touchEventHandler.bind( this ) );

        this.setCss();
    }

    getGameName () {
        //const gameData = gameInformation.gameListStore[ this.selectedGameId ];
        const gameData = InGameInformation.instance.inGameListStore[ this.selectedGameId ];
        //return gameData[extensions.getParameter('lang')] ?? gameData['en'];
        return gameData[ this.urlLanguage ] ?? gameData[ 'en' ];
    }

    showConfirmDialog ( gameId ) {
        this.selectedGameId = parseInt( gameId );
        if ( this.IS_NEED_CONFIRM ) {
            this.createConfirmWindow();
        } else {
            this.requestToOpenNewGame( this.selectedGameId );
        }
    }

    requestToOpenNewGame ( gameId ) {
        this.gameInstance.getGameUrl( gameId );
    }

    requestToCloseWindow () {
        if ( this.isNeedToUpdate ) {
            this.gameInstance.updateFavoriteList();
        } else {
            this.closeWindowAndSave();
        }
    }

    closeWindowAndSave () {
        this.$inGameMenuPopupWindow.remove();
    }

    onResize ( isPortrait ) {
        this.isPortrait = isPortrait;
        if ( $( '.ingamemenu' ).length ) {
            this.setCss();
        }

        if ( $( '.confirmContainer' ).length ) {
            this.setCss();
        }
    }

    setCss () {
        let scale;
        let rate; // * Please don't ask me why need this... because I really don't know...
        if ( this.isPortrait ) {
            scale = VIEW_CONFIG.WIDTH * this.ratio / this.POPUP_WIDTH;
            rate = 0.86;
        } else {
            scale = 320 * this.ratio / this.POPUP_WIDTH;
            rate = 0.9;
        }

        if ( this.$inGameMenuPopupWindow ) {
            // 最外層的div
            this.$inGameMenuPopupWindow.width( window.innerWidth );
            this.$inGameMenuPopupWindow.height( window.innerHeight );
            // 裡面塞html檔的內容
            this.$inGameMenu.width( this.POPUP_WIDTH );
            this.$inGameMenu.height( this.POPUP_HEIGHT * rate );
            this.$inGameMenu.css( 'transform', 'scale(' + scale + ')' );
            // 關閉按鈕
            this.$closeButton.css( 'z-index', 99 );

            if ( this.isPortrait ) {
                this.$inGameMenuContent.width( '672px' );
                this.$inGameMenuContent.height( '1138px' );

                this.$containerFluid.css( 'top', '162px' );
                this.$containerFluid.css( 'left', '10px' );
                this.$containerFluid.css( 'width', '650px' );
                this.$containerFluid.css( 'height', '950px' );

                this.$background.removeClass( 'igm_bg_hor' );
                this.$background.addClass( 'igm_bg_ver' );
                $( '.igm-main-container' ).css( 'transform', 'scale(1.2)' );
                $( '.igm-main-container' ).css( 'top', '116px' );

                this.$closeButton.css( 'top', '10px' );
                this.$closeButton.css( 'right', '10px' );
                this.$closeButton.css( 'transform', 'scale(1)' );
            } else {
                this.$inGameMenuContent.width( '1111px' );
                this.$inGameMenuContent.height( '633px' );

                this.$containerFluid.css( 'top', '90px' );
                this.$containerFluid.css( 'left', '10px' );
                this.$containerFluid.css( 'width', '1084px' );
                this.$containerFluid.css( 'height', '502px' );

                this.$background.removeClass( 'igm_bg_ver' );
                this.$background.addClass( 'igm_bg_hor' );
                $( '.igm-main-container' ).css( 'transform', 'scale(2)' );
                $( '.igm-main-container' ).css( 'top', '430px' );

                this.$closeButton.css( 'top', '10px' );
                this.$closeButton.css( 'right', '16px' );
            }

            this.refreshTab();
        }

        if ( this.$confirmWindow ) {
            this.$confirmWindow.width( window.innerWidth );
            this.$confirmWindow.height( window.innerHeight );

            if ( this.isPortrait ) {
                this.$confirmContainer.css( 'transform', 'scale(' + scale + ')' );
            } else {
                let landscapeScale = 640 * this.ratio / this.POPUP_WIDTH
                this.$confirmContainer.css( 'transform', 'scale(' + landscapeScale + ')' );
            }
        }
    }

    removeItem ( array, item ) {
        let index = array.indexOf( item );
        if ( index > -1 ) {
            array.splice( index, 1 );
        }
        return array;
    }

    public setLanguage ( set: string ) {
        this.urlLanguage = set;
        this.setDisplayLanguage();
    }

    public setRatio ( set: number ) {
        this.ratio = set;
    }
}