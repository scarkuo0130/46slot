import { InGameInformation } from '../ingamemenu/InGameInformation';
import { VIEW_CONFIG } from './config';
import { igmUtils } from '../utils/igmUtils';

const MODE_RANDOM = 0;
const MODE_COLUMN = 1;
const MODE_MULTIPLIER = 2;
const MODE_TOURNAMENT = -1;
const MODE_NEW_CASH_DROP = 3;

const REFRESH_FREQUENCY = 300000;
const LOCALSTORAGE_JACKPOT_KEY = 'settings_for_jp';

export class PromotionalContent {

    promotionInstance;
    ratio = 16 / 9;

	constructor(pmInstance) {
        this.promotionInstance = pmInstance;
        
		this.POPUP_WIDTH = 890;
		this.POPUP_HEIGHT = 1660;
		this.promoteInformation = InGameInformation.instance.promotionInformation;
        this.jackpotInformation = InGameInformation.instance.jackpotInformation;
		this.promotionLastUpdateTime = Date.now();
        this.jackpotLastUpdateTime = Date.now();
		this.$promotionPopupWindow = null;
		this.$promotionButtonClose = null;
		this.$promote = null;
        //this.$promoteblur = null;
		//判斷已執行過init的開關
		this.hasInit = false;
        this.hasJpInit = false;
		//外面點擊切換到第幾個活動引數
		this.slideToIndex = 0;
		this.isPortrait = true;

        this.$jackpotPopupWindow = null;
        this.$jackpotButtonClose = null;
        this.$jackpot = null;
        //this.$jackpotblur = null;

        this.isLoaded = false;
	}

	init(isJp, isPortrait) {
        if (isJp) {
            this.createJackpotWindow();
            this.hasJpInit = true;
        } else {
            this.createPromotionWindow();
            this.hasInit = true;
        }

		this.isPortrait = isPortrait;
	}

    createPromotionWindow() {
        let url = './promotionalContent.html';
        fetch(url).then( response => response.text() ).then((result) => {
            this.$promotionPopupWindow = $('<div class="popup-window"></div>');
            this.$promotionPopupWindow.hide();

            this.$promote = $('<div class="promote"></div>');
            this.$promote.append(result);
            //this.$promoteblur = $('<div class="promoteblur"></div>');
            //this.$promotionPopupWindow.append( this.$promoteblur );
            this.$promotionPopupWindow.append(this.$promote);

            // * Append to `promotionContent` div
            $('#promotionContent').prepend(this.$promotionPopupWindow);

            for (let i = 0; i < this.promoteInformation.length; i++) {
                this.$swiperSlide = $('<div class="swiper-slide"></div>');
                $('.mySwiperContent .swiper-wrapper').append(this.$swiperSlide);
                this.$promoteContent = $('<div class="promote-content"></div>');
                this.$swiperSlide.append(this.$promoteContent);
                this.$containerFluid = $('<div class="container-fluid"></div>');
                this.$promoteContent.append(this.$containerFluid);

                this.$title = $('<div class="text-center text-white mt-3 mb-5" style = "height:360px; width: 80%; margin: auto; position: relative; top: 0px; z-index: 999;">' +
                    '<h1>' + this.promoteInformation[i].promotion_name + '</h1>' +
                    '</div>');
                this.$containerFluid.append(this.$title);

                //this.$subTitle = '<div class="text-center text-white mb-5" style="position: relative; top: -30px;">' + '<h3>' + (this.promoteInformation[i].promotion_type === 0 ? 'Cash Drop' : 'Tournament') + '</h3>' + '</div>';
                //this.$containerFluid.append(this.$subTitle);

                let min_bet_content = '';
                if ( this.promoteInformation[ i ].promotion_type === 0 && this.promoteInformation[ i ].min_bet ) min_bet_content = 'Minimum bet amount:' + this.promoteInformation[ i ].min_bet;
                //this.$hint = $('<div class="text-center mt-1 mb-2" id="hint" style="position: relative; top: -50px;"><h3> Data update interval : 10 minutes </h3></div>');
                this.$hint = $( '<div class="text-center mt-1 mb-2" id="hint" style="position: relative; top: -50px;"><h3> ' + min_bet_content + ' </h3></div>' );
                this.$containerFluid.append(this.$hint);

                /*this.$tabUl = $('<ul class="nav justify-content-center"></ul>');
                this.$tabLi = $('<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#prizes' + i + '">Prizes</a></li>' +
                    '<li class="nav-item fw-bold"><a class="nav-link active" data-bs-toggle="tab" href="#winners' + i + '">Winners</a></li>' +
                    '<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#history' + i + '">History</a></li>' +
                    '<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#rules' + i + '">Rules</a></li>')*/
                this.$tabUl = $('<ul class="nav nav-pills nav-fill" id="pills-tab" role="tablist"></ul>');
                this.$tabLi = $('<li class="nav-item pill-prizes" role="presentation"><button class="nav-link" id="pills-prizes-tab" data-bs-toggle="pill" data-bs-target="#pills-prizes' + i + '" type="button" role="tab" aria-controls="pills-prizes" aria-selected="false">Prizes</button></li>' +
                    '<li class="nav-item pill-winners" role="presentation"><button class="nav-link active" id="pills-winners-tab" data-bs-toggle="pill" data-bs-target="#pills-winners' + i + '" type="button" role="tab" aria-controls="pills-winners" aria-selected="false">Winners</button></li>' +
                    '<li class="nav-item pill-history" role="presentation"><button class="nav-link" id="pills-history-tab" data-bs-toggle="pill" data-bs-target="#pills-history' + i + '" type="button" role="tab" aria-controls="pills-history" aria-selected="false">History</button></li>' +
                    '<li class="nav-item pill-rules" role="presentation"><button class="nav-link" id="pills-rules-tab" data-bs-toggle="pill" data-bs-target="#pills-rules' + i + '" type="button" role="tab" aria-controls="pills-rules" aria-selected="false">Rules</button></li>');

                this.$tabContent = $('<div class="tab-content"></div>');
                switch (this.promoteInformation[i].mode) {
                    case MODE_RANDOM:
                        this.createPrizePage(i, 'randomPrize');
                        this.createDropWinnerPage(i);
                        this.createHistoryPage(i);
                        this.createRulePage(i);
                        break;
                    case MODE_COLUMN:
                        this.createPrizePage(i, 'columnPrize');
                        this.createDropWinnerPage(i);
                        this.createHistoryPage(i);
                        this.createRulePage(i);
                        break;
                    case MODE_MULTIPLIER:
                        this.createPrizePage(i, 'multiplierPrize');
                        this.createDropMultiplierWinnerPage(i);
                        this.createHistoryPage(i);
                        this.createRulePage(i);
                        break;
                    case MODE_TOURNAMENT:
                        /*this.$tabLi = $('<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#prizes' + i + '">Prizes</a></li>' +
                            '<li class="nav-item fw-bold"><a class="nav-link active" data-bs-toggle="tab" href="#winners' + i + '">Winners</a></li>' +
                            '<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#rules' + i + '">Rules</a></li>')*/
                        this.$tabLi = $( '<li class="nav-item pill-prizes" role="presentation"><button class="nav-link" id="pills-prizes-tab" data-bs-toggle="pill" data-bs-target="#pills-prizes' + i + '" type="button" role="tab" aria-controls="pills-prizes" aria-selected="false">Prizes</button></li>' +
                            '<li class="nav-item pill-winners" role="presentation"><button class="nav-link active" id="pills-winners-tab" data-bs-toggle="pill" data-bs-target="#pills-winners' + i + '" type="button" role="tab" aria-controls="pills-winners" aria-selected="false">Winners</button></li>' +
                            '<li class="nav-item pill-rules" role="presentation"><button class="nav-link" id="pills-rules-tab" data-bs-toggle="pill" data-bs-target="#pills-rules' + i + '" type="button" role="tab" aria-controls="pills-rules" aria-selected="false">Rules</button></li>' );
                        this.createPrizePage(i, 'tournamentPrize');
                        this.createTournamentWinnerPage(i);
                        this.createRulePage(i);
                        break;
                    case MODE_NEW_CASH_DROP:
                            this.createPrizePage(i, 'randomPrize');
                            this.createDropWinnerPage(i);
                            this.createHistoryPage(i);
                            this.createRulePage(i);
                        break ;
                }
                this.$tabUl.append(this.$tabLi);
                this.$containerFluid.append(this.$tabUl);
                this.$containerFluid.append(this.$tabContent);

                //this.$hint = $('<div class="mt-1 mb-2" id="hint" style="position: relative; top: -70px;"><h4> Data update interval : 10 minutes </h4></div>');
                //this.$containerFluid.append(this.$hint);
                if (this.promoteInformation[i].promotion_type === 0) {
                    $('.mySwiperPagination .swiper-wrapper').append('<div class="swiper-slide" id="icon_CrazyCashDrop' + i + '">' + '<div style="cursor:pointer" class="cashdrop_' + i % 5 + ' sprites"><div style="height:120px" class="text-white text-center mt-3"><div class="promotionalContentTitle" style="font-size: 24px; font-weight: bold;">' + this.promoteInformation[i].promotion_name + '</div></div><div class="text-dark text-center fw-bold"><div class="left-time"></div></div></div>' + '</div>');
                } else {
                    $('.mySwiperPagination .swiper-wrapper').append('<div class="swiper-slide" id="icon_CrazyCashDrop' + i + '">' + '<div style="cursor:pointer" class="tournament_' + i % 5 + ' sprites"><div style="height:120px" class="text-white text-center mt-3"><div class="promotionalContentTitle" style="font-size: 24px; font-weight: bold;">' + this.promoteInformation[i].promotion_name + '</div></div><div class="text-dark text-center fw-bold"><div class="left-time"></div></div></div>' + '</div>');
                }
            }
            this.$promotionButtonClose = $('<div class="promote-button-close mt-2"></div>');
            this.$promote.append(this.$promotionButtonClose);

            let $closeImage = $('<div style="cursor:pointer" class="promote_but_close sprites"></div>');
            this.$promotionButtonClose.append($closeImage);
            this.getLeftTime();

            setInterval(() => {
                this.getLeftTime();
            }, 1000);

            this.addHtml(true);
        });
    }

    createJackpotWindow() {
        let url = './jackpotContent.html';
        fetch(url).then( response => response.text() ).then((result) => {
            this.$jackpotPopupWindow = $('<div class="popup-window"></div>');
            this.$jackpotPopupWindow.hide();
            
            // * create jackpot tab data
            this.$jackpot = $('<div class="jackpot"></div>');

            this.$jackpot.append(result);
            //this.$jackpotblur = $('<div class="jackpotblur"></div>');
            //this.$jackpotPopupWindow.append(this.$jackpotblur);
            this.$jackpotPopupWindow.append(this.$jackpot);

            $('#jackpotContent').prepend(this.$jackpotPopupWindow);

            for (let i = 0; i < this.jackpotInformation.length; i++) {
                this.$swiperSlide = $('<div class="swiper-slide"></div>');
                $('.jpSwiperContent .swiper-wrapper').append(this.$swiperSlide);
                this.$promoteContent = $('<div class="promote-content"></div>');
                this.$swiperSlide.append(this.$promoteContent);
                this.$containerFluid = $('<div class="container-fluid"></div>');
                this.$promoteContent.append(this.$containerFluid);

                this.$title = $(
                    '<div class="text-center text-white mt-3 mb-5" style = "height:360px; width: 80%; margin: auto; position: relative; top: 0px;">' +
                    '<h1>' + this.jackpotInformation[i].promotion_name + '</h1>' +
                    '</div>'
                );
                this.$containerFluid.append(this.$title);

                //let subTitleText = 'Jackpot';
                //this.$subTitle = '<div class="text-center text-white mb-5">' + '<h3>' + subTitleText + '</h3>' + '</div>';
                //this.$containerFluid.append(this.$subTitle);

                // * Under middle `Data update...` hint 
                this.$hint = $('<div class="text-center mt-1 mb-2" id="hint" style="position: relative; top: -50px;"><h3> Data update interval : 10 minutes </h3></div>');
                this.$containerFluid.append(this.$hint);

                /*this.$tabUl = $('<ul class="nav justify-content-center"></ul>');
                this.$tabLi = $(
                    '<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#jackpotprizes' + i + '">Prizes</a></li>' +
                    '<li class="nav-item fw-bold"><a class="nav-link active" data-bs-toggle="tab" href="#jackpotwinners' + i + '">Winners</a></li>' +
                    '<li class="nav-item fw-bold"><a class="nav-link" data-bs-toggle="tab" href="#jackpotsetting' + i + '">Setting</a></li>'
                );*/
                this.$tabUl = $('<ul class="nav nav-pills nav-fill" id="pills-tab" role="tablist"></ul>');
                this.$tabLi = $(
                    '<li class="nav-item pill-jackpotprizes" role="presentation"><button class="nav-link" id="pills-jackpotprizes-tab" data-bs-toggle="pill" data-bs-target="#pills-jackpotprizes' + i + '" type="button" role="tab" aria-controls="pills-jackpotprizes" aria-selected="false">Prizes</button></li>' +
                    '<li class="nav-item pill-jackpotwinners" role="presentation"><button class="nav-link active" id="pills-jackpotwinners-tab" data-bs-toggle="pill" data-bs-target="#pills-jackpotwinners' + i + '" type="button" role="tab" aria-controls="pills-jackpotwinners" aria-selected="false">Winners</button></li>' +
                    '<li class="nav-item pill-jackpotsetting" role="presentation"><button class="nav-link" id="pills-jackpotsetting-tab" data-bs-toggle="pill" data-bs-target="#pills-jackpotsetting' + i + '" type="button" role="tab" aria-controls="pills-jackpotsetting" aria-selected="false">Setting</button></li>'
                );

                this.$tabContent = $('<div class="tab-content"></div>');

                // * Fix create these 3 pages
                this.createJackpotPrizesPage(i);
                this.createJackpotWinnersPage(i);
                this.createJackpotSettingPage(i);

                this.$tabUl.append(this.$tabLi);
                this.$containerFluid.append(this.$tabUl);
                this.$containerFluid.append(this.$tabContent);
                // * Under middle `Data update...` hint 
                //this.$hint = $('<div class="mt-1 mb-2" id="hint"><h4> Data update interval : 10 minutes </h4></div>');
                //this.$containerFluid.append(this.$hint);

                // * Bottom squares
                $('.jpSwiperPagination .swiper-wrapper').append(
                    '<div class="swiper-slide" id="icon_jackpot">' + 
                        '<div style="cursor:pointer" class="jackpot_0 sprites"></div>' + 
                    '</div>'
                );
            }

            // * Close button
            this.$jackpotButtonClose = $('<div class="promote-button-close mt-2"></div>');
            this.$jackpot.append(this.$jackpotButtonClose);

            let $closeImage = $('<div style="cursor:pointer" class="promote_but_close sprites"></div>');
            this.$jackpotButtonClose.append($closeImage);

            // *
            this.addJpHtml(true);
        });
    }

	addHtml(isFirstTime) {
		this.createSwiper();
		this.$promotionPopupWindow.show();
		this.onResize(this.isPortrait);
        if (isFirstTime) {
            this.addListener();
        }
	}

    addJpHtml(isFirstTime) {
		this.createJpSwiper();
		this.$jackpotPopupWindow.show();
		this.onResize(this.isPortrait);
        if (isFirstTime) {
            this.addJpListener();
        }
	}

	onResize(isPortrait) {
		this.isPortrait = isPortrait;
		if ($('.promote').length) {
			// 每次偵測到視窗尺寸有變動就重新設css
			this.setCss();
		}
        if ($('.jackpot').length) {
            this.setCss();
        }
	}

	setCss() {
		// ****** 這一段不太會動到 ******

        let scale;
		if (this.isPortrait) {
			scale = VIEW_CONFIG.WIDTH * this.ratio / this.POPUP_WIDTH;
		} else {
			scale = 320 * this.ratio / this.POPUP_WIDTH;
		}

        if (this.$promotionPopupWindow) {
            // 最外層的div
            this.$promotionPopupWindow.width(window.innerWidth);
            this.$promotionPopupWindow.height(window.innerHeight);
            // 裡面塞html檔的內容
            this.$promote.width(this.POPUP_WIDTH);
            this.$promote.height(this.POPUP_HEIGHT * 0.9);
            this.$promote.css('transform', 'scale(' + scale + ')');
            //this.$promoteblur.width( this.POPUP_WIDTH + 50 );
            //this.$promoteblur.height( (this.POPUP_HEIGHT + 50) * 0.9 );
            //this.$promoteblur.css( 'transform', 'scale(' + scale + ')' );
            // 關閉按鈕
            this.$promotionButtonClose.css('z-index', 99);
        }

        // * Jackpot components
        if (this.$jackpotPopupWindow) {
            this.$jackpotPopupWindow.width(window.innerWidth);
            this.$jackpotPopupWindow.height(window.innerHeight);

            this.$jackpot.width(this.POPUP_WIDTH);
            this.$jackpot.height(this.POPUP_HEIGHT * 0.9);
            this.$jackpot.css('transform', 'scale(' + scale + ')');
            //this.$jackpotblur.width( this.POPUP_WIDTH + 50 );
            //this.$jackpotblur.height( (this.POPUP_HEIGHT + 50) * 0.9 );
            //this.$jackpotblur.css( 'transform', 'scale(' + scale + ')' );

            this.$jackpotButtonClose.css('z-index', 99);
        }
	}

	addListener() {
		this.$promotionButtonClose.on('click', this.hidePromotionContent.bind(this));
		this.$promotionPopupWindow.on('click', this.hidePromotionContent.bind(this));
		this.$promote.on('click', function (event) {
			// 阻止冒泡事件
			event.stopPropagation();
		});
	}

    addJpListener() {
        this.$jackpotButtonClose.on('click', this.hideJackpotContent.bind(this));
        this.$jackpotPopupWindow.on('click', this.hideJackpotContent.bind(this));
        this.$jackpot.on('click', this.checkJackpotSettingState.bind(this));
    }

	hidePromotionContent() {
		this.$promotionPopupWindow.hide();
	}

    hideJackpotContent() {
		this.$jackpotPopupWindow.hide();
	}

	getList(index, type) {
		let content = '';
		let multiple = '50x'
		let playerId = '5689754';
		let totalBet = 1000;
		let playerAward = 100;
		switch (type) {
			case 'dropMultiplePlayerData':
				if (this.promoteInformation[index].winner === undefined) {
					for (let i = 0; i < 20; i++) {
						content += '<tr>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'</tr>';
					}
					return content;
				}
				for (let i = 0; i < this.promoteInformation[index].winner.length; i++) {
					content += '<tr>' +
						'<td>' + this.promoteInformation[index].winner[i].account + '</td>' +
						'<td>' + this.promoteInformation[index].winner[i].multiplier + '</td>' +
						'<td class="pd10 text-end">' + this.changeUnit( this.promoteInformation[index].winner[i].bet_credit ) + '</td>' +
						'<td class="pd10 text-end">' + this.changeUnit( this.promoteInformation[index].winner[i].prize_credit ) + '</td>' +
						'</tr>';
				}
				for (let i = this.promoteInformation[index].winner.length; i < 20; i++) {
					content += '<tr>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'</tr>';
				}
				break;
			case 'dropPlayerData':
				if (this.promoteInformation[index].winner === undefined) {
					for (let i = 0; i < 20; i++) {
						content += '<tr>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'</tr>';
					}
					return content;
				}
				for (let i = 0; i < this.promoteInformation[index].winner.length; i++) {
					content += '<tr>' +
						'<td>' + this.promoteInformation[index].winner[i].account + '</td>' +
						'<td class="pd200 text-end">' + this.changeUnit( this.promoteInformation[index].winner[i].prize_credit ) + '</td>' +
						'</tr>';
				}
				for (let i = this.promoteInformation[index].winner.length; i < 20; i++) {
					content += '<tr>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'</tr>';
				}
				break;

			case 'randomPrize':
				content = '<tr>' +
					'<td>Maximum</td>' +
					'<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.changeUnit( this.promoteInformation[index].mode_rule[1] ) + '</td>' +
					'</tr>' +
					'<tr>' +
					'<td>Minimum</td>' +
					'<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.changeUnit( this.promoteInformation[index].mode_rule[0] ) + '</td>' +
					'</tr>';
				break;

			case 'columnPrize':
				for (let i = 0; i < this.promoteInformation[index].mode_rule.length; i++) {
					content += '<tr>' +
						'<td>' + (i + 1) + '</td>' +
						'<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.changeUnit( this.promoteInformation[index].mode_rule[i] ) + '</td>' +
						'</tr>';
				}
				break;
			case 'multiplierPrize':
				for (let i = 0; i < this.promoteInformation[index].mode_rule.length; i++) {
					content += '<tr>' +
						'<td>' + (i + 1) + '</td>' +
						'<td>' + this.promoteInformation[index].mode_rule[i] + 'x' + '</td>' +
						'</tr>';
				}
				break;
			case 'history':
				if (this.promoteInformation[index].user === undefined || this.promoteInformation[index].user.length === 0) {
					for (let i = 0; i < 20; i++) {
						content += '<tr>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'</tr>';
					}
					return content;
				}
				for (let i = 0; i < this.promoteInformation[index].user.length; i++) {
					content += '<tr>' +
						'<td>' + this.promoteInformation[index].user[i].date + '</td>' +
						'<td class="pd200 text-end">' + this.changeUnit( this.promoteInformation[index].user[i].prize_credit ) + '</td>' +
						'</tr>';
				}
				break;
			case 'tournamentPrize':
				for (let i = 0; i < this.promoteInformation[index].bonus_setting.length; i++) {
					if (this.promoteInformation[index].bonus_setting[i].start_rank === this.promoteInformation[index].bonus_setting[i].end_rank) {
						content += '<tr>' +
							'<td>' + this.promoteInformation[index].bonus_setting[i].start_rank + '</td>' +
							'<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.changeUnit( this.promoteInformation[index].bonus_setting[i].bonus ) + '</td>' +
							'</tr>';
					} else {
						content += '<tr>' +
							'<td>' + this.promoteInformation[index].bonus_setting[i].start_rank + '-' + this.promoteInformation[index].bonus_setting[i].end_rank + '</td>' +
							'<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.changeUnit( this.promoteInformation[index].bonus_setting[i].bonus ) + '</td>' +
							'</tr>';
					}
				}
				break;
			case 'tournamentPlayerData':
				if (this.promoteInformation[index].winner === undefined) {
					for (let i = 0; i < 20; i++) {
						content += '<tr>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'</tr>';
					}
					return content;
				}
				for (let i = 0; i < this.promoteInformation[index].winner.length; i++) {
					content += '<tr id="tournamentPlayer' + index + '-' + i + '">' +
						'<td>' + (i + 1) + '</td>' +
						'<td>' + this.promoteInformation[index].winner[i].account + '</td>' +
						'<td class="pd10 text-end">' + this.changeUnit( this.promoteInformation[index].winner[i].credit ) + '</td>' +
						(this.changeUnit( this.promoteInformation[index].winner[i].prize_credit ) === '0' ? '<td class="pd10"> - </td>' : '<td class="pd10 text-end">' + this.changeUnit( this.promoteInformation[index].winner[i].prize_credit ) + '</td>') +
						'</tr>';
				}
				for (let i = this.promoteInformation[index].winner.length; i < 20; i++) {
					content += '<tr>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'</tr>';
				}
				break;
            
            case 'jackpotData':
                if (this.jackpotInformation[index].winner === undefined) {
					for (let i = 0; i < 20; i++) {
						content += '<tr>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'<td> - </td>' +
							'</tr>';
					}
					return content;
				}
                for (let i = 0; i < this.jackpotInformation[index].winner.length; i++) {
                    content += '<tr id="JackpotPlayer' + index + '-' + i + '">' +
                        '<td>' + this.capitalizeFirstLetter(this.jackpotInformation[index].winner[i].prize_type) + '</td>' + // grand
                        '<td>' + this.jackpotInformation[index].winner[i].account + '</td>' +
                        '<td>' + this.changeUnit( this.jackpotInformation[index].winner[i].prize_credit) + '</td>';
				}
                for (let i = this.jackpotInformation[index].winner.length; i < 20; i++) {
					content += '<tr>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'<td> - </td>' +
						'</tr>';
				}
                break;
            case 'timesPrize':
                    content = '<tr>' +
                        '<td>Winning amount</td>' +
                        '<td class="pd200 text-end">' + this.promoteInformation[index].currency + ' ' + this.promoteInformation[index].mode_rule[1].changeUnit() + '</td>' +
                        '</tr>';
                break;
		}
		return content;
	}

	createPrizePage(i, type) {
		let prizeTitle = 'Prizes';
		let award = type === 'multiplierPrize' ? 'Bet Multiplier' : 'Amounts';
		//this.$tabPane = $('<div class="tab-pane prize" id="prizes' + i + '"></div>');
        this.$tabPane = $( '<div class="tab-pane prize fade" id="pills-prizes' + i + '" role="tabpanel" aria-labelledby="pills-prizes-tab">' );
		this.$tabContent.append(this.$tabPane);
		let $row = $('<div class="row"></div>');
		this.$tabPane.append($row);
		this.$playerContent = $('<div class="col">' +
			/*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
			'<thead>' +
			'<tr>' +
			'<th>' + prizeTitle + '</th>' +
			'<th>' + award + '</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			this.getList(i, type) +
			'</tbody>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerContent);
	}

	createDropWinnerPage(i) {
		let playerName = 'Winners';
		let award = 'Amounts' + '(' + this.promoteInformation[i].currency + ')';
		//let $tabPane = $('<div class="tab-pane winners active" id="winners' + i + '"></div>');
        let $tabPane = $( '<div class="tab-pane winners fade show active" id="pills-winners' + i + '" role="tabpanel" aria-labelledby="pills-winners-tab">' );
		this.$tabContent.append($tabPane);
		let $row = $('<div class="row"></div>');
		$tabPane.append($row);
		this.$playerContent = $('<div class="col">' +
			/*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
			'<thead>' +
			'<tr>' +
			'<th>' + playerName + '</th>' +
			'<th>' + award + '</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			this.getList(i, 'dropPlayerData') +
			'</tbody>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerContent);
		this.$playerFoot = $('<div>' +
			'<table class="table text-center table-borderless">' +
			'<thead>' +
			'<tr class="bg-primary">' +
			'<th id="userAccount' + i + '"> My Score </th>' +
			'<th id="userPrize' + i + '"> _ </th>' +
			'</tr>' +
			'</thead>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerFoot);
	}

	createTournamentWinnerPage(i) {
		let prizeTitle = 'Prizes';
		let playerName = 'Winners';
		let score = 'Score' + '(' + this.promoteInformation[i].currency + ')';
		let award = 'Amounts' + '(' + this.promoteInformation[i].currency + ')';
		//let $tabPane = $('<div class="tab-pane winners active" id="winners' + i + '"></div>');
        let $tabPane = $( '<div class="tab-pane winners fade show active" id="pills-winners' + i + '" role="tabpanel" aria-labelledby="pills-winners-tab">' );
		this.$tabContent.append($tabPane);
		let $row = $('<div class="row"></div>');
		$tabPane.append($row);
		this.$playerContent = $('<div class="col">' +
			/*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
			'<thead>' +
			'<tr>' +
			'<th>' + prizeTitle + '</th>' +
			'<th>' + playerName + '</th>' +
			'<th>' + score + '</th>' +
			'<th>' + award + '</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			this.getList(i, 'tournamentPlayerData') +
			'</tbody>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerContent);
		this.$playerFoot = $('<div>' +
			'<table class="table text-center table-borderless">' +
			'<thead>' +
			'<tr class="bg-primary">' +
			'<th id="rank' + i + '"></th>' +
			'<th id="userAccount' + i + '"> My Score </th>' +
			'<th id="credit' + i + '"></th>' +
			'<th id="userPrize' + i + '"></th>' +
			'</tr>' +
			'</thead>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerFoot);
	}

	createDropMultiplierWinnerPage(i) {
		let mutiple = 'Multiplier';
		let playerName = 'Winners';
		let totalBet = 'Bet' + '(' + this.promoteInformation[i].currency + ')';
		let award = 'Amounts' + '(' + this.promoteInformation[i].currency + ')';
		//let $tabPane = $('<div class="tab-pane winners active" id="winners' + i + '"></div>');
        let $tabPane = $( '<div class="tab-pane winners fade show active" id="pills-winners' + i + '" role="tabpanel" aria-labelledby="pills-winners-tab">' );
		this.$tabContent.append($tabPane);
		let $row = $('<div class="row"></div>');
		$tabPane.append($row);
		this.$playerContent = $('<div class="col">' +
			/*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
			'<thead>' +
			'<tr>' +
			'<th>' + playerName + '</th>' +
			'<th>' + mutiple + '</th>' +
			'<th>' + totalBet + '</th>' +
			'<th>' + award + '</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			this.getList(i, 'dropMultiplePlayerData') +
			'</tbody>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerContent);
		this.$playerFoot = $('<div>' +
			'<table class="table text-center table-borderless">' +
			'<thead>' +
			'<tr class="bg-primary">' +
			'<th id="userAccount' + i + '"> My Score </th>' +
			'<th id="mutiple' + i + '"> _ </th>' +
			'<th id="totalBet' + i + '"> _ </th>' +
			'<th id="userPrize' + i + '"> _ </th>' +
			'</tr>' +
			'</thead>' +
			'</table>' +
			'</div>');
		$row.append(this.$playerFoot);
	}

	createRulePage(i) {
		//let $tabPane = $('<div class="tab-pane rules" id="rules' + i + '"></div>');
        let $tabPane = $( '<div class="tab-pane rules fade" id="pills-rules' + i + '" role="tabpanel" aria-labelledby="pills-rules-tab">' );
		this.$tabContent.append($tabPane);
		let $row = $('<div class="row"></div>');
		$tabPane.append($row);
		this.$rule = $('<div class="col">' +
			'<p class="rule" style="word-break: normal; overflow-wrap: break-word;">' + this.promoteInformation[i].promotion_content + '</p>' +
			'</div>');
		$row.append(this.$rule);
	}

	createHistoryPage(i) {
		let date = 'Date';
		let award = 'Amounts' + '(' + this.promoteInformation[i].currency + ')';
		//let $tabPane = $('<div class="tab-pane history" id="history' + i + '"></div>');
        let $tabPane = $( '<div class="tab-pane history fade" id="pills-history' + i + '" role="tabpanel" aria-labelledby="pills-history-tab">' );
		this.$tabContent.append($tabPane);
		let $row = $('<div class="row"></div>');
		$tabPane.append($row);
		this.$historyContent = $('<div class="col">' +
			/*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
			'<thead>' +
			'<tr>' +
			'<th>' + date + '</th>' +
			'<th>' + award + '</th>' +
			'</tr>' +
			'</thead>' +
			'<tbody>' +
			this.getList(i, 'history') +
			'</tbody>' +
			'</table>' +
			'</div>');
		$row.append(this.$historyContent);
	}

    createJackpotPrizesPage(i) {
        //let $tabDiv = $('<div class="tab-pane prize" id="jackpotprizes' + i + '"></div>');
        let $tabDiv = $( '<div class="tab-pane prize fade" id="pills-jackpotprizes' + i + '" role="tabpanel" aria-labelledby="pills-jackpotprizes-tab">' );
        this.$tabContent.append($tabDiv);
        let $rowDiv = $('<div class="row"></div>');
        $tabDiv.append($rowDiv);

        let prizeTitle = 'Prizes';
        let amountTitle = 'Amounts' + '(' + this.jackpotInformation[i].currency + ')';
        let content = this.promotionInstance.jackpotTierData['content'] ? this.promotionInstance.jackpotTierData['content'] : '';
        // * Create table
        this.$playerContent = $(
            '<div class="col">' +
            /*'<table class="table text-center table-borderless">' +*/
            '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
                '<thead>' + 
                    '<tr>' +
                        '<th>' + prizeTitle + '</th>' +
                        '<th>' + amountTitle + '</th>' +
                    '</tr>' +
                '</thead>' +
                // * Jackpot Information
                '<tbody>' +
                    '<tr>' + // * Grand
                        '<td>Grand</td>' +
                        '<td id="grandValue" class="pd200 text-end">' + this.capitalizeFirstLetter(this.promotionInstance.jackpotTierData['grand']) + '</td>' +
                    '</tr>' +
                    '<tr>' + // * Major
                        '<td>Major</td>' +
                        '<td id="majorValue" class="pd200 text-end">' + this.capitalizeFirstLetter(this.promotionInstance.jackpotTierData['major']) + '</td>' +
                    '</tr>' +
                    '<tr>' + // * Minor
                        '<td>Minor</td>' +
                        '<td id="minorValue" class="pd200 text-end">' + this.capitalizeFirstLetter(this.promotionInstance.jackpotTierData['minor']) + '</td>' +
                    '</tr>' +
                    '<tr>' + // * Mini
                        '<td>Mini</td>' +
                        '<td id="miniValue" class="pd200 text-end">' + this.capitalizeFirstLetter(this.promotionInstance.jackpotTierData['mini']) + '</td>' +
                    '</tr>' +
                '</tbody>' +
            '</table>' +
            // * Event information
            '<p id="contentValue" class="rule">' + content + '</p>' +
            '</div>'
        );
        $rowDiv.append(this.$playerContent);
    }

    createJackpotWinnersPage(i) {
        //let $tabDiv = $('<div class="tab-pane winners active" id="jackpotwinners' + i + '"></div>');
        let $tabDiv = $( '<div class="tab-pane winners fade show active" id="pills-jackpotwinners' + i + '" role="tabpanel" aria-labelledby="pills-jackpotwinners-tab">' );
        this.$tabContent.append($tabDiv);
        let $rowDiv = $('<div class="row"></div>');
        $tabDiv.append($rowDiv);

        let prizeTitle = 'Prizes';
        let winnersTitle = 'Winners';
        let amountTitle = 'Amounts' + '(' + this.jackpotInformation[i].currency + ')';
        this.$playerContent = $(
            '<div class="col">' +
                /*'<table class="table text-center table-borderless">' +*/
                '<table data-toggle="table" class="table text-center table-dark table-striped table-bordered border-gray">' +
                    '<thead>' +
                        '<tr>' +
                            '<th>' + prizeTitle + '</th>' +
                            '<th>' + winnersTitle + '</th>' +
                            '<th>' + amountTitle + '</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    this.getList(i, 'jackpotData') +
                    '</tbody>' +
                '</table>' +
			'</div>'
        );
		$rowDiv.append(this.$playerContent);

        // * My Score
        this.$playerFoot = $(
            '<div>' +
                '<table class="table text-center table-borderless">' +
                    '<thead>' +
                        '<tr class="bg-primary">' +
                            '<th id="myJpPrizeType' + i + '"></th>' +
                            '<th id="myJpAccount' + i + '"> My Score </th>' +
                            '<th id="myJpAmount' + i + '"></th>' +
                        '</tr>' +
                    '</thead>' +
                '</table>' +
			'</div>'
        );
		$rowDiv.append(this.$playerFoot);

    }

    createJackpotSettingPage(i) {
        //let $tabDiv = $('<div class="tab-pane setting" id="jackpotsetting' + i + '"></div>');
        let $tabDiv = $( '<div class="tab-pane setting fade" id="pills-jackpotsetting' + i + '" role="tabpanel" aria-labelledby="pills-jackpotsetting-tab">' );
        this.$tabContent.append($tabDiv);

        let $rowDiv = $('<div class="row"></div>');
        $tabDiv.append($rowDiv);

        // * The `col` is container for display all setting items
        this.$playerContent = $('<div class="col"></div>');

        // * Append padding div, pd20top means `padding-top: 20px`
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<div class="pd20top"></div>');

        // * Add a switch and label
        this.$switch = $('<div class="form-switch"></div>');
        this.$switchLabel = $('<label class="form-check-label" for="JackpotNotification">Winning notification</label>');

        this.$jackpotNoticationSwitch = $(
            '<input class="form-check-input" type="checkbox" role="switch" id="JackpotNotification" checked>'
        );

        this.$switch.append(this.$jackpotNoticationSwitch);
        this.$switch.append(this.$switchLabel);

        this.$playerContent.append(this.$switch);

        // * Padding and divide line
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<hr class="divide">');
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<div class="pd20top"></div>');

        // * My notifications
        this.$playerContent.append('<div class="tag-label">My notification</div>');

        // * The 4 items
        let $myBlock = $('<div class="pd200left"></div>');
        this.$myGrand = this.getCheckBox('myGrand', 'Grand');
        $myBlock.append(this.$myGrand);
        this.$myMajor = this.getCheckBox('myMajor', 'Major');
        $myBlock.append(this.$myMajor);
        $myBlock.append('<div class="pd20top"></div>');
        this.$myMinor = this.getCheckBox('myMinor', 'Minor');
        $myBlock.append(this.$myMinor);
        this.$myMini = this.getCheckBox('myMini', 'Mini');
        $myBlock.append(this.$myMini);
        this.$playerContent.append($myBlock);

        // * Padding and divide line
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<hr class="divide">');
        this.$playerContent.append('<div class="pd20top"></div>');
        this.$playerContent.append('<div class="pd20top"></div>');

        // * Other players
        this.$playerContent.append('<div class="tag-label">Other players</div>');

        // * The 4 items
        let $otherBlock = $('<div class="pd200left"></div>');
        this.$otherGrand = this.getCheckBox('otherGrand', 'Grand');
        $otherBlock.append(this.$otherGrand);
        this.$otherMajor = this.getCheckBox('otherMajor', 'Major');
        $otherBlock.append(this.$otherMajor);
        $otherBlock.append('<div class="pd20top"></div>');
        this.$otherMinor = this.getCheckBox('otherMinor', 'Minor');
        $otherBlock.append(this.$otherMinor);
        this.$otherMini = this.getCheckBox('otherMini', 'Mini');
        $otherBlock.append(this.$otherMini);
        this.$playerContent.append($otherBlock);

        $rowDiv.append(this.$playerContent);
    }

    loadSettings() {
        if (!this.isLoaded) {
            $('#JackpotNotification').prop('checked', JACKPOT_NOTIFICATIONS.notification);
            let settings = JACKPOT_NOTIFICATIONS.settings;
            let allKeys = Object.keys(JACKPOT_NOTIFICATIONS.settings);
            for (let i = 0; i < allKeys.length; i++) {
                $(`#${allKeys[i]}`).prop('checked', settings[allKeys[i]]);
            }
            this.isLoaded = true;
        }
    }

    saveSettings() {
        if (this.isLoaded) {
            // * JACKPOT_NOTIFICATIONS is a global variable for save the notification states
            JACKPOT_NOTIFICATIONS.notification = $('#JackpotNotification').prop('checked');

            let allKeys = Object.keys(JACKPOT_NOTIFICATIONS.settings);
            for (let i = 0; i < allKeys.length; i++) {
                JACKPOT_NOTIFICATIONS.settings[allKeys[i]] = $(`#${allKeys[i]}`).prop('checked');
            }

            let storage = window.localStorage;
            storage.setItem(LOCALSTORAGE_JACKPOT_KEY, JSON.stringify(JACKPOT_NOTIFICATIONS));
        }
    }

    checkJackpotSettingState(event) {
        let tabAttr = $('#pills-jackpotsetting0').attr('class');
        let isActived = tabAttr.includes('active');

        // * We only process when setting tab actived
        if (isActived) {
            this.loadSettings();
            let allKeys = Object.keys(JACKPOT_NOTIFICATIONS.settings);

            let $notificationSwitch = $('#JackpotNotification');
            if ($notificationSwitch.prop('checked')) {
                for (let i = 0; i < allKeys.length; i++) {
                    $(`#${allKeys[i]}`).prop('disabled', false);
                }
            } else {
                for (let i = 0; i < allKeys.length; i++) {
                    $(`#${allKeys[i]}`).prop('disabled', true);
                }
            }
        }

        this.saveSettings();
        event.stopPropagation();
    }

    getCheckBox(id, label) {
        let $checkBox = $(
            '<div class="form-check">' +
                `<input class="form-check-input" type="checkbox" value="" id="${id}">` +
                `<label class="form-check-label" for="${id}">${label}</label>` +
            '</div>'
        );
        return $checkBox;
    }

	sendPromoteApi(time) {
		if (this.hasInit === true) {
			this.addHtml();
			if (time > this.promotionLastUpdateTime) {
                this.promotionInstance.sendGetCashDropPrizeRecord();
				this.promotionLastUpdateTime = time + REFRESH_FREQUENCY;
			}
		} else {
            this.promotionInstance.sendGetCashDrop();
			this.promotionLastUpdateTime = time + REFRESH_FREQUENCY;
		}
	}

    sendJackpotRefreshApi(time) {
        if (this.hasJpInit === true) {
			this.addJpHtml();
			if (time > this.jackpotLastUpdateTime) {
                this.promotionInstance.sendGetJpPrizeRecord();
				this.jackpotLastUpdateTime = time + REFRESH_FREQUENCY;
			} else {
                this.promotionInstance.sendGetJpAmount();
            }
		} else {
            this.promotionInstance.sendGetJp();
			this.jackpotLastUpdateTime = time + REFRESH_FREQUENCY;
		}
    }

	updatePromoteWinner() {
		//只要最新一筆,所以取陣列0
		for (let i = 0; i < this.promoteInformation.length; i++) {
			$('#pills-winners' + i + ' tbody').html(this.getList(i, this.promoteInformation[i].mode === 2 ? 'dropMultiplePlayerData' : this.promoteInformation[i].mode === -1 ? 'tournamentPlayerData' : 'dropPlayerData'));
			if (this.promoteInformation[i].user !== undefined) {
				if (this.promoteInformation[i].promotion_type === 0) {
					$('#userPrize' + i).html(this.promoteInformation[i].user[0] !== undefined ? this.toFixedNoRound(this.promoteInformation[i].user[0].prize_credit) : '_');
					$('#mutiple' + i).html(this.promoteInformation[i].user[0] !== undefined ? this.promoteInformation[i].user[0].multiplier : '_');
					$('#totalBet' + i).html(this.promoteInformation[i].user[0] !== undefined ? this.promoteInformation[i].user[0].bet_credit : '_');
					$('#credit' + i).html(this.promoteInformation[i].user[0] !== undefined ? this.promoteInformation[i].user[0].credit : '_');
					$('#pills-history' + i + ' tbody').html(this.getList(i, 'history'));
				} else {
					$('#userPrize' + i).html( this.changeUnit( this.toFixedNoRound( this.promoteInformation[i].user.prize_credit )) === '0' ? '-' : this.changeUnit( this.toFixedNoRound(this.promoteInformation[i].user.prize_credit)));
					$('#rank' + i).html((this.promoteInformation[i].user.rank + 1) > 500 ? '500+' : (this.promoteInformation[i].user.rank + 1));
					$('#credit' + i).html(this.changeUnit(this.promoteInformation[i].user.credit));
					//$('#tournamentPlayer' + i + '-' + this.promoteInformation[i].user.rank).css("background-color", '#ffea00');
                    $('#tournamentPlayer' + i + '-' + this.promoteInformation[i].user.rank).addClass("table-primary");
					$('#tournamentPlayer' + i + '-' + this.promoteInformation[i].user.rank + ' td').css("color", 'black');
				}
			}
		}
	}

    updateJackpotWinner() {
        // * We just need to process 1 data, because Jackpot is the only one event
        for (let i = 0; i < this.jackpotInformation.length; i++) {
			$('#pills-jackpotwinners' + i + ' tbody').html(this.getList(i, 'jackpotData'));
            if (this.jackpotInformation[i].user !== undefined && this.jackpotInformation[i].user.length !== 0) {
                $('#myJpPrizeType' + i).html(this.capitalizeFirstLetter(this.jackpotInformation[i].user[0].prize_type));
                $('#myJpAccount' + i).html(this.jackpotInformation[i].user[0].account);
                $('#myJpAmount' + i).html(this.changeUnit(this.jackpotInformation[i].user[0].prize_credit));
			}
		}
    }

    updateJackpotTierInfotmation() {
        $('#grandValue').html(this.promotionInstance.jackpotTierData['grand']);
        $('#majorValue').html(this.promotionInstance.jackpotTierData['major']);
        $('#minorValue').html(this.promotionInstance.jackpotTierData['minor']);
        $('#miniValue').html(this.promotionInstance.jackpotTierData['mini']);

        let content = this.promotionInstance.jackpotTierData['content'] ? this.promotionInstance.jackpotTierData['content'] : '';
        $('#contentValue').html(content);
    }

	createAllPage(isJackpot) {
		this.init(isJackpot);
	}

	getLeftTime() {
		for (let i = 0; i < this.promoteInformation.length; i++) {
			//換算時區時間差異
			let timeDifference = new Date(this.promoteInformation[i].end_date.replace(/-/g, '/')).getTime() - new Date(new Date().toLocaleString('sv-SE', { timeZone: this.promoteInformation[i].time_zone }).replace(/-/g, '/'));
			let date = Math.floor(timeDifference / 1000 / 86400);
			let hour = Math.floor(timeDifference / 1000 % 86400 / 3600);
			let minute = Math.floor(timeDifference / 1000 % 86400 % 3600 / 60);
			let second = Math.floor(timeDifference / 1000 % 86400 % 3600 % 60);

			if (timeDifference < 0) {
				$('#finished' + i).css('visibility', 'visible');
				$('#finished' + i).css('display', 'block');
				if (this.promoteInformation[i].promotion_type === 0) {
					$('#icon_CrazyCashDrop' + i).html('<div style="cursor:pointer" class="cashdrop_finished_' + i % 5 + ' sprites"><div class="text-white text-center mt-3"><div class="promotionalContentTitle" style="font-size: 24px; font-weight: bold;">' + this.promoteInformation[i].promotion_name + '</div><div class="left-time"></div></div></div>');
				} else {
					$('#icon_CrazyCashDrop' + i).html('<div style="cursor:pointer" class="tournament_finished_' + i % 5 + ' sprites"><div class="text-white text-center mt-3"><div class="promotionalContentTitle" style="font-size: 24px; font-weight: bold;">' + this.promoteInformation[i].promotion_name + '</div><div class="left-time"></div></div></div>');
				}
			} else {
				$('.swiper-slide .left-time')[i].innerHTML = date + 'd ' + hour + 'h ' + minute + 'm ' + second + 's';
			}
		}
	}

	createSwiper() {
		this.mySwiperThumbs = new Swiper('.mySwiperPagination', {
            spaceBetween: 25,
			slidesPerView: 2,
			freeMode: false,
			mousewheel: true,
			/*width: 839,*/
            centeredSlides: true,
        });
        this.mySwiper = new Swiper('.mySwiperContent', {
			spaceBetween: 0,
			//thumbs: {
			//	swiper: {
			//		el: '.mySwiperPagination',
			//		spaceBetween: 25,
			//		slidesPerView: 2,
			//		freeMode: false,
			//		mousewheel: true,
			//		width: 839,
			//		/*scrollbar: {
			//			el: '.swiper-scrollbar',
			//			draggable: true,
			//			snapOnRelease: true
			//		},*/
			//	},
			//},
			threshold: 10,
            speed: 0,
		});
        this.mySwiper.controller.control = this.mySwiperThumbs;
        this.mySwiperThumbs.controller.control = this.mySwiper;
		this.mySwiper.slideTo(this.slideToIndex, 1000, false);
        this.mySwiperThumbs.slideTo(this.slideToIndex, 1000, false);
	}

    createJpSwiper() {
        // * Jackpot swiper content
        this.jpSwiperThumbs = new Swiper('.jpSwiperPagination', {
            spaceBetween: 25,
			slidesPerView: 2,
			freeMode: false,
			mousewheel: true,
			/*width: 839,*/
            centeredSlides: true,
        });
        this.jpSwiper = new Swiper('.jpSwiperContent', {
			spaceBetween: 0,
			//thumbs: {
			//	swiper: {
			//		el: '.jpSwiperPagination',
			//		spaceBetween: 25,
			//		slidesPerView: 2,
			//		freeMode: false,
			//		mousewheel: true,
			//		width: 839,
			//		/*scrollbar: {
			//			el: '.swiper-scrollbar',
			//			draggable: true,
			//			snapOnRelease: true
			//		},*/
			//	},
			//},
			threshold: 10,
            speed: 0,
		});
        this.jpSwiper.controller.control = this.jpSwiperThumbs;
        this.jpSwiperThumbs.controller.control = this.jpSwiper;
        // * Always slide to 0, because the Jackpot event is the only one
		this.jpSwiper.slideTo(0, 1000, false);
        this.jpSwiperThumbs.slideTo(0, 1000, false);
    }

	setSlideToIndex(slideToIndex) {
		this.slideToIndex = slideToIndex;
	}

    capitalizeFirstLetter(value) {
        if (typeof (value) === 'string') {
            return value.charAt(0).toUpperCase() + value.slice(1);
        } else {
            return value;
        }
    }
    public changeUnit ( value: number | string, allowThousand: boolean = false ): string {
        return igmUtils.changeUnit( value, allowThousand );
    }
    public toFixedNoRound ( value: number | string, fixed: number ): string {
        return igmUtils.toFixedNoRound( value, fixed );
    }
    
    public setRatio ( set: number ) {
        this.ratio = set;
    }
}