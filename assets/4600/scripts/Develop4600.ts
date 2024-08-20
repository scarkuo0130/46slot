import { _decorator, Component, sys,Button } from 'cc';
import { Utils, _utilsDecorator } from '../../sub_module/utils/Utils';
import { Machine } from '../../sub_module/game/machine/Machine';
const { ccclass, property } = _decorator;
const { isDevelopFunction } = _utilsDecorator;

@ccclass('Develop4600')
export class Develop4600 extends Component {

    @property({displayName:'模擬覆寫 machine.spinResponse'})
    public isOverrideSpinResponse:boolean = false;


    public static Instance: Develop4600 = null;
    public simulateFeatureGame:boolean = false;

    @isDevelopFunction(true)
    onLoad() {
        Develop4600.Instance = this;
    }

    public get machine() { return cc.machine; }

    @isDevelopFunction(true)
    async start() {
        if ( Utils.isDevelopment() === false ) return;
        await Utils.delay(1000);
        if ( this.machine == null ) return;
        this.developOverrideFunction();
        cc.develop = this;
    }

    /** 開發期間的覆寫函式 */
    @isDevelopFunction(true)
    private async developOverrideFunction() {
        if ( !this.isOverrideSpinResponse ) return;
        this.machine.spinResponse = this.developSpinResponse.bind(this);

        // 移除 onclick 
        let buttonNode : Node = this.machine.paytable.buyFeatureGame.properties.BuyFeatureGameUI.buyButton.node;
        buttonNode.on('click', this.DevelopClickBuyFeatureGame, this);
    }

    /**
     * 攔截 paytable buyFeatureGameUI 的 clickBuyFeatureGame
     */
    @isDevelopFunction(true)
    private DevelopClickBuyFeatureGame() {
        this.simulateFeatureGame = true;
        return this.machine.controller.clickSpin();
    }

    /** 開發期間複寫 machine.spinResponse */
    @isDevelopFunction(true)
    public developSpinResponse(spinData:any) {

        let mainGames = this.saveMainGame(spinData);
        /*
        if ( this.simulateFeatureGame ) {
            this.make_subGameResponse(spinData);
            this.simulateFeatureGame = false;
        }*/

        // 有沒有 wild
        if ( this.haveWild(spinData) ) {
            let jp_level = this.machine.paytable.JP_LEVEL + 1;
            if ( jp_level > 4 ) {
                jp_level = 4;
                let jp = Utils.Random(0, 3);
                let jp_prize = this.machine.totalBet * this.machine.paytable.JP_REWARD[jp];
                spinData['main_game']['jp_type'] = jp;
                spinData['main_game']['jp_prize'] = jp_prize;
            }
            spinData['main_game']['jp_level'] = jp_level;
        }

        console.log('spinData', spinData);
        // 以下是原本的 machine.spinResponse
        let event = this.machine.properties['spinEvent'];
        event['result'] = spinData;
        this.machine.properties['spinData'] = spinData;
        event.emit('done');
        this.isOverrideSpinResponse = false;
    }

    @isDevelopFunction(true)
    public simulateFeatureGameSpinResponse() {
        let mainGameList = this.loadStorage('mainGame');
        if ( mainGameList.length < 10 ) return alert('請先 Spin 10 次以上');

        let result = [];
        let pay_credit_total = 0;
        for(let i = 0; i < 10; i++) {
            let mainGame = mainGameList[i];
            mainGame['free_spin_times'] = 0;
            pay_credit_total += mainGame['pay_credit_total'];
            result.push(mainGame);
        }

        return { 'pay_credit_total' : pay_credit_total, 'result' : result };
    }

    @isDevelopFunction(true)
    private make_subGameResponse(spinData) {
        spinData['sub_game'] = this.simulateFeatureGameSpinResponse();
        spinData['get_sub_game'] = true;
        spinData['main_game']['free_spin_times'] = 10;

        spinData['main_game']['result_reels'][0][1] = 12;
        spinData['main_game']['result_reels'][2][1] = 12;
        spinData['main_game']['result_reels'][4][1] = 12;
    }

    @isDevelopFunction(true)
    private saveMainGame(spinData:any) {
        let mainGame = spinData['main_game'];
        
        let mainGameList = this.loadStorage('mainGame');
        if ( mainGameList == null ) mainGameList = [];
        mainGameList.push(mainGame);

        if ( mainGameList.length > 30 ) mainGameList.shift();

        this.saveStorage('mainGame', mainGameList);
        return mainGameList;
    }

    @isDevelopFunction(true)
    private saveStorage(key:string, value:any) {
        sys.localStorage.setItem(key, JSON.stringify(value));
    }

    @isDevelopFunction(true)
    private loadStorage(key:string) {
        let value = sys.localStorage.getItem(key);
        return JSON.parse(value);
    }

    @isDevelopFunction(true)
    private removeStorage(key:string) {
        sys.localStorage.removeItem(key);
    }

    @isDevelopFunction(true)
    private getStorageKeys() {
        let keys = [];
        for(let i = 0; i < sys.localStorage.length; i++) {
            keys.push(sys.localStorage.key(i));
        }
        return keys;
    }

    @isDevelopFunction(true)
    private haveWild(spinData:any) {
        let reel : number[][] = spinData['main_game']['result_reels'];
        let haveWild = false;
        for(let i = 0; i < reel.length; i++) {
            if ( haveWild ) break;
            let row = reel[i];
            for(let j = 0; j < row.length; j++) {
                if ( row[j] === 0 ) {
                    haveWild = true;
                    break;
                }
            }
        }
        
        return haveWild;
    }

    @isDevelopFunction(true)
    private nowDateTime() : string {
        const date = new Date();
        const mm = date.getMonth() + 1; // getMonth() is zero-based
        const dd = date.getDate();
        const hh = date.getHours();
        const min = date.getMinutes();
        const ss = date.getSeconds();

        return [date.getFullYear(), (mm>9 ? '' : '0') + mm, (dd>9 ? '' : '0') + dd].join('') + (hh>9 ? '' : '0') + hh + (min>9 ? '' : '0') + min + (ss>9 ? '' : '0') + ss;
    }

    @isDevelopFunction(true)
    public JP() {
        Machine.Instance.spinTest({
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 200000,
                "result_reels": [
                    [
                        6,
                        9,
                        5
                    ],
                    [
                        3,
                        7,
                        5
                    ],
                    [
                        6,
                        10,
                        1
                    ],
                    [
                        1,
                        1,
                        0
                    ],
                    [
                        3,
                        9,
                        4
                    ]
                ],
                "near_win": 0,
                "free_spin_times": 0,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 1,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [],
                "jp_type": 2,
                "jp_prize": 200000,
                "jp_level": 4
            },
            "get_sub_game": false,
            "sub_game": {
                "pay_credit_total": 0,
                "result": null
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 499972600,
            "bet_credit": 2000,
            "payout_credit": 200000,
            "change_credit": -2000,
            "effect_credit": 2000,
            "buy_spin": 0,
            "buy_spin_multiplier": 1,
            "extra": null
        });
    }

    @isDevelopFunction(true)
    public JPtoFG() {
        Machine.Instance.spinTest({
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 10000,
                "result_reels": [
                    [
                        5,
                        12,
                        9
                    ],
                    [
                        12,
                        2,
                        6
                    ],
                    [
                        1,
                        7,
                        12
                    ],
                    [
                        9,
                        2,
                        7
                    ],
                    [
                        5,
                        8,
                        0
                    ]
                ],
                "near_win": 1,
                "free_spin_times": 10,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            1,
                            -1
                        ],
                        [
                            1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 3,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [
                    {
                        "symbol_id": 12,
                        "length": 3,
                        "way": [
                            1,
                            1,
                            1
                        ],
                        "pay_credit": 10000
                    }
                ],
                "jp_type": 2,
                "jp_prize": 200000,
                "jp_level": 4
            },
            "get_sub_game": true,
            "sub_game": {
                "pay_credit_total": 30800,
                "result": [
                    {
                        "pay_credit_total": 800,
                        "result_reels": [
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                4,
                                4,
                                0
                            ],
                            [
                                5,
                                5,
                                3
                            ],
                            [
                                2,
                                2,
                                3
                            ],
                            [
                                4,
                                1,
                                1
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 5,
                                "length": 3,
                                "way": [
                                    2,
                                    1,
                                    2
                                ],
                                "pay_credit": 800
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 12000,
                        "result_reels": [
                            [
                                5,
                                2,
                                2
                            ],
                            [
                                2,
                                2,
                                4
                            ],
                            [
                                1,
                                0,
                                1
                            ],
                            [
                                5,
                                5,
                                2
                            ],
                            [
                                3,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 2,
                                "length": 4,
                                "way": [
                                    2,
                                    2,
                                    1,
                                    1
                                ],
                                "pay_credit": 12000
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                5,
                                5
                            ],
                            [
                                2,
                                5,
                                5
                            ],
                            [
                                3,
                                3,
                                4
                            ],
                            [
                                1,
                                1,
                                1
                            ],
                            [
                                2,
                                2,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 17400,
                        "result_reels": [
                            [
                                4,
                                5,
                                5
                            ],
                            [
                                4,
                                1,
                                5
                            ],
                            [
                                0,
                                1,
                                4
                            ],
                            [
                                4,
                                5,
                                5
                            ],
                            [
                                4,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 4,
                                "length": 5,
                                "way": [
                                    1,
                                    1,
                                    2,
                                    1,
                                    1
                                ],
                                "pay_credit": 15000
                            },
                            {
                                "symbol_id": 5,
                                "length": 4,
                                "way": [
                                    2,
                                    1,
                                    1,
                                    2
                                ],
                                "pay_credit": 2400
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                2,
                                2
                            ],
                            [
                                3,
                                12,
                                1
                            ],
                            [
                                12,
                                1,
                                3
                            ],
                            [
                                4,
                                4,
                                3
                            ],
                            [
                                3,
                                3,
                                3
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 600,
                        "result_reels": [
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                2,
                                3,
                                4
                            ],
                            [
                                1,
                                0,
                                1
                            ],
                            [
                                12,
                                2,
                                2
                            ],
                            [
                                2,
                                2,
                                2
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 4,
                                "length": 3,
                                "way": [
                                    1,
                                    1,
                                    1
                                ],
                                "pay_credit": 600
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                4,
                                4
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                3,
                                3,
                                3
                            ],
                            [
                                2,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                3,
                                3
                            ],
                            [
                                1,
                                4,
                                4
                            ],
                            [
                                2,
                                1,
                                0
                            ],
                            [
                                4,
                                4,
                                12
                            ],
                            [
                                4,
                                4,
                                1
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                4,
                                4,
                                2
                            ],
                            [
                                5,
                                5,
                                3
                            ],
                            [
                                3,
                                2,
                                2
                            ],
                            [
                                5,
                                0,
                                2
                            ],
                            [
                                3,
                                3,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                1,
                                5,
                                5
                            ],
                            [
                                3,
                                3,
                                12
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                1,
                                1,
                                1
                            ],
                            [
                                2,
                                2,
                                12
                            ]
                        ],
                        "near_win": -1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    }
                ]
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 499940800,
            "bet_credit": 100000,
            "payout_credit": 40800,
            "change_credit": -59200,
            "effect_credit": 100000,
            "buy_spin": 1,
            "buy_spin_multiplier": 50,
            "extra": null
        });
    }

    @isDevelopFunction(true)
    public FGtoJP() {
        Machine.Instance.spinTest({
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 10000,
                "result_reels": [
                    [
                        5,
                        12,
                        9
                    ],
                    [
                        12,
                        2,
                        6
                    ],
                    [
                        1,
                        7,
                        12
                    ],
                    [
                        9,
                        2,
                        7
                    ],
                    [
                        5,
                        8,
                        0
                    ]
                ],
                "near_win": 1,
                "free_spin_times": 10,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            1,
                            -1
                        ],
                        [
                            1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 3,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [
                    {
                        "symbol_id": 12,
                        "length": 3,
                        "way": [
                            1,
                            1,
                            1
                        ],
                        "pay_credit": 10000
                    }
                ],
                "jp_type": -1,
                "jp_prize": 0,
            },
            "get_sub_game": true,
            "sub_game": {
                "pay_credit_total": 30800,
                "result": [
                    {
                        "pay_credit_total": 800,
                        "result_reels": [
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                4,
                                4,
                                0
                            ],
                            [
                                5,
                                5,
                                3
                            ],
                            [
                                2,
                                2,
                                3
                            ],
                            [
                                4,
                                1,
                                1
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 5,
                                "length": 3,
                                "way": [
                                    2,
                                    1,
                                    2
                                ],
                                "pay_credit": 800
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 12000,
                        "result_reels": [
                            [
                                5,
                                2,
                                2
                            ],
                            [
                                2,
                                2,
                                4
                            ],
                            [
                                1,
                                0,
                                1
                            ],
                            [
                                5,
                                5,
                                2
                            ],
                            [
                                3,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 2,
                                "length": 4,
                                "way": [
                                    2,
                                    2,
                                    1,
                                    1
                                ],
                                "pay_credit": 12000
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                5,
                                5
                            ],
                            [
                                2,
                                5,
                                5
                            ],
                            [
                                3,
                                3,
                                4
                            ],
                            [
                                1,
                                1,
                                1
                            ],
                            [
                                2,
                                2,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 217400,
                        "result_reels": [
                            [
                                4,
                                5,
                                5
                            ],
                            [
                                4,
                                1,
                                5
                            ],
                            [
                                0,
                                1,
                                4
                            ],
                            [
                                4,
                                5,
                                5
                            ],
                            [
                                0,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 4,
                                "length": 5,
                                "way": [
                                    1,
                                    1,
                                    2,
                                    1,
                                    1
                                ],
                                "pay_credit": 15000
                            },
                            {
                                "symbol_id": 5,
                                "length": 4,
                                "way": [
                                    2,
                                    1,
                                    1,
                                    2
                                ],
                                "pay_credit": 2400
                            }
                        ],
                        "jp_type": 2,
                        "jp_prize": 200000,
                        "jp_level": 4
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                2,
                                2
                            ],
                            [
                                3,
                                12,
                                1
                            ],
                            [
                                12,
                                1,
                                3
                            ],
                            [
                                4,
                                4,
                                3
                            ],
                            [
                                3,
                                3,
                                3
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 600,
                        "result_reels": [
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                2,
                                3,
                                4
                            ],
                            [
                                1,
                                0,
                                1
                            ],
                            [
                                12,
                                2,
                                2
                            ],
                            [
                                2,
                                2,
                                2
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 4,
                                "length": 3,
                                "way": [
                                    1,
                                    1,
                                    1
                                ],
                                "pay_credit": 600
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                4,
                                4
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                3,
                                3,
                                3
                            ],
                            [
                                2,
                                3,
                                3
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                3,
                                3
                            ],
                            [
                                1,
                                4,
                                4
                            ],
                            [
                                2,
                                1,
                                0
                            ],
                            [
                                4,
                                4,
                                12
                            ],
                            [
                                4,
                                4,
                                1
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                4,
                                4,
                                2
                            ],
                            [
                                5,
                                5,
                                3
                            ],
                            [
                                3,
                                2,
                                2
                            ],
                            [
                                5,
                                0,
                                2
                            ],
                            [
                                3,
                                3,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                1,
                                5,
                                5
                            ],
                            [
                                3,
                                3,
                                12
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                1,
                                1,
                                1
                            ],
                            [
                                2,
                                2,
                                12
                            ]
                        ],
                        "near_win": -1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    }
                ]
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 499940800,
            "bet_credit": 100000,
            "payout_credit": 40800,
            "change_credit": -59200,
            "effect_credit": 100000,
            "buy_spin": 1,
            "buy_spin_multiplier": 50,
            "extra": null
        });
    }

    @isDevelopFunction(true)
    public FGtoFG() {
        Machine.Instance.spinTest({
                "game_id": 4600,
                "main_game": {
                    "pay_credit_total": 10000,
                    "result_reels": [
                        [
                            9,
                            5,
                            12
                        ],
                        [
                            6,
                            12,
                            2
                        ],
                        [
                            12,
                            1,
                            7
                        ],
                        [
                            4,
                            4,
                            9
                        ],
                        [
                            8,
                            11,
                            1
                        ]
                    ],
                    "near_win": 1,
                    "free_spin_times": 10,
                    "scatter_info": {
                        "id": [
                            12,
                            0
                        ],
                        "position": [
                            [
                                -1,
                                -1,
                                1
                            ],
                            [
                                -1,
                                1,
                                -1
                            ],
                            [
                                1,
                                -1,
                                -1
                            ],
                            [
                                -1,
                                -1,
                                -1
                            ],
                            [
                                -1,
                                -1,
                                -1
                            ]
                        ],
                        "amount": 3,
                        "multiplier": 1,
                        "pay_credit": 0,
                        "pay_rate": 0
                    },
                    "lines": [
                        {
                            "symbol_id": 12,
                            "length": 3,
                            "way": [
                                1,
                                1,
                                1
                            ],
                            "pay_credit": 10000
                        }
                    ],
                    "jp_type": -1,
                    "jp_prize": 0
                },
                "get_sub_game": true,
                "sub_game": {
                    "pay_credit_total": 4800,
                    "result": [
                        {
                            "pay_credit_total": 800,
                            "result_reels": [
                                [
                                    4,
                                    5,
                                    5
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    5,
                                    3,
                                    3
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    4,
                                    4,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 5,
                                    "length": 3,
                                    "way": [
                                        2,
                                        2,
                                        1
                                    ],
                                    "pay_credit": 800
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    1,
                                    1,
                                    5
                                ],
                                [
                                    2,
                                    12,
                                    4
                                ],
                                [
                                    4,
                                    4,
                                    5
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    3,
                                    3,
                                    1
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {    
                            "pay_credit_total": 10000,
                            "result_reels": [
                                [
                                    9,
                                    5,
                                    12
                                ],
                                [
                                    6,
                                    12,
                                    2
                                ],
                                [
                                    12,
                                    1,
                                    7
                                ],
                                [
                                    4,
                                    4,
                                    9
                                ],
                                [
                                    8,
                                    11,
                                    1
                                ]
                            ],
                            "near_win": 1,
                            "free_spin_times": 10,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 3,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 12,
                                    "length": 3,
                                    "way": [
                                        1,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 10000
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    5
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    3,
                                    3,
                                    2
                                ],
                                [
                                    5,
                                    1,
                                    1
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 600,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    3,
                                    3,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    2
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 4,
                                    "length": 3,
                                    "way": [
                                        1,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 600
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    4,
                                    2,
                                    2
                                ],
                                [
                                    3,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    2,
                                    0,
                                    3
                                ],
                                [
                                    1,
                                    5,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    2
                                ],
                                [
                                    4,
                                    4,
                                    0
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    2,
                                    0,
                                    3
                                ],
                                [
                                    4,
                                    4,
                                    2
                                ]
                            ],
                            "near_win": 1,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 2,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 400,
                            "result_reels": [
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    5,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    12,
                                    1,
                                    1
                                ],
                                [
                                    5,
                                    5,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 5,
                                    "length": 3,
                                    "way": [
                                        2,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 400
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 600,
                            "result_reels": [
                                [
                                    3,
                                    3,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    0,
                                    3,
                                    3
                                ],
                                [
                                    1,
                                    1,
                                    5
                                ],
                                [
                                    4,
                                    2,
                                    2
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 4,
                                    "length": 3,
                                    "way": [
                                        1,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 600
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    3,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    5,
                                    4
                                ],
                                [
                                    3,
                                    5,
                                    5
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    2,
                                    3,
                                    3
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 800,
                            "result_reels": [
                                [
                                    4,
                                    5,
                                    5
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    5,
                                    3,
                                    3
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    4,
                                    4,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 5,
                                    "length": 3,
                                    "way": [
                                        2,
                                        2,
                                        1
                                    ],
                                    "pay_credit": 800
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    1,
                                    1,
                                    5
                                ],
                                [
                                    2,
                                    12,
                                    4
                                ],
                                [
                                    4,
                                    4,
                                    5
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    3,
                                    3,
                                    1
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    4,
                                    2,
                                    2
                                ],
                                [
                                    3,
                                    5,
                                    5
                                ],
                                [
                                    2,
                                    2,
                                    1
                                ],
                                [
                                    5,
                                    5,
                                    1
                                ],
                                [
                                    3,
                                    4,
                                    4
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    5
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    3,
                                    3,
                                    2
                                ],
                                [
                                    5,
                                    1,
                                    1
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 600,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    3,
                                    3,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    2
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 4,
                                    "length": 3,
                                    "way": [
                                        1,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 600
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    4,
                                    2,
                                    2
                                ],
                                [
                                    3,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    2,
                                    0,
                                    3
                                ],
                                [
                                    1,
                                    5,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    2,
                                    2,
                                    2
                                ],
                                [
                                    4,
                                    4,
                                    0
                                ],
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    2,
                                    0,
                                    3
                                ],
                                [
                                    4,
                                    4,
                                    2
                                ]
                            ],
                            "near_win": 1,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 2,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 400,
                            "result_reels": [
                                [
                                    5,
                                    5,
                                    3
                                ],
                                [
                                    5,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    12,
                                    1,
                                    1
                                ],
                                [
                                    5,
                                    5,
                                    5
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 5,
                                    "length": 3,
                                    "way": [
                                        2,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 400
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 600,
                            "result_reels": [
                                [
                                    3,
                                    3,
                                    4
                                ],
                                [
                                    2,
                                    2,
                                    4
                                ],
                                [
                                    0,
                                    3,
                                    3
                                ],
                                [
                                    1,
                                    1,
                                    5
                                ],
                                [
                                    4,
                                    2,
                                    2
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 1,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [
                                {
                                    "symbol_id": 4,
                                    "length": 3,
                                    "way": [
                                        1,
                                        1,
                                        1
                                    ],
                                    "pay_credit": 600
                                }
                            ],
                            "jp_type": -1,
                            "jp_prize": 0
                        },
                        {
                            "pay_credit_total": 0,
                            "result_reels": [
                                [
                                    3,
                                    3,
                                    3
                                ],
                                [
                                    5,
                                    5,
                                    4
                                ],
                                [
                                    3,
                                    5,
                                    5
                                ],
                                [
                                    5,
                                    4,
                                    4
                                ],
                                [
                                    2,
                                    3,
                                    3
                                ]
                            ],
                            "near_win": 0,
                            "free_spin_times": 0,
                            "scatter_info": {
                                "id": [
                                    12,
                                    0
                                ],
                                "position": [
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ],
                                    [
                                        -1,
                                        -1,
                                        -1
                                    ]
                                ],
                                "amount": 0,
                                "multiplier": 1,
                                "pay_credit": 0,
                                "pay_rate": 0
                            },
                            "lines": [],
                            "jp_type": -1,
                            "jp_prize": 0
                        }

                    ]
                },
                "get_jackpot": false,
                "jackpot": {
                    "jackpot_id": "",
                    "jackpot_credit": 0,
                    "symbol_id": null
                },
                "get_jackpot_increment": false,
                "jackpot_increment": null,
                "grand": 0,
                "major": 0,
                "minor": 0,
                "mini": 0,
                "user_credit": 499912400,
                "bet_credit": 100000,
                "payout_credit": 12400,
                "change_credit": -87600,
                "effect_credit": 100000,
                "buy_spin": 1,
                "buy_spin_multiplier": 50,
                "extra": null
            }
        );
    }

    @isDevelopFunction(true)
    public spinTest1() {
        Machine.Instance.spinTest({
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 100,
                "result_reels": [
                    [
                        12,
                        8,
                        6
                    ],
                    [
                        1,
                        1,
                        0
                    ],
                    [
                        3,
                        9,
                        6
                    ],
                    [
                        4,
                        9,
                        2
                    ],
                    [
                        4,
                        4,
                        8
                    ]
                ],
                "near_win": 0,
                "free_spin_times": 0,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 1,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [
                    {
                        "symbol_id": 6,
                        "length": 3,
                        "way": [
                            1,
                            1,
                            1
                        ],
                        "pay_credit": 100
                    }
                ],
                "jp_type": -1,
                "jp_prize": 0
            },
            "get_sub_game": false,
            "sub_game": {
                "pay_credit_total": 0,
                "result": null
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 499988800,
            "bet_credit": 2000,
            "payout_credit": 100,
            "change_credit": -1900,
            "effect_credit": 2000,
            "buy_spin": 0,
            "buy_spin_multiplier": 1,
            "extra": null
        });
    }

    @isDevelopFunction(true)
    public spinTest2() {
        Machine.Instance.spinTest({
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 20300,
                "result_reels": [
                    [
                        7,
                        2,
                        2
                    ],
                    [
                        3,
                        7,
                        4
                    ],
                    [
                        0,
                        10,
                        8
                    ],
                    [
                        0,
                        10,
                        8
                    ],
                    [
                        3,
                        9,
                        4
                    ]
                ],
                "near_win": 1,
                "free_spin_times": 0,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            1,
                            -1,
                            -1
                        ],
                        [
                            1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 2,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [
                    {
                        "symbol_id": 7,
                        "length": 4,
                        "way": [
                            1,
                            1,
                            1,
                            1
                        ],
                        "pay_credit": 300
                    }
                ],
                "jp_type": 3,
                "jp_prize": 20000,
                "noLoop": false
            },
            "get_sub_game": false,
            "sub_game": {
                "pay_credit_total": 0,
                "result": null
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 500012300,
            "bet_credit": 2000,
            "payout_credit": 20300,
            "change_credit": 18300,
            "effect_credit": 2000,
            "buy_spin": 0,
            "buy_spin_multiplier": 1,
            "extra": null
        });
    }

    @isDevelopFunction(true)
    public FG_end() {
        let spinData = {
            "game_id": 4600,
            "main_game": {
                "pay_credit_total": 10000,
                "result_reels": [
                    [
                        5,
                        12,
                        9
                    ],
                    [
                        6,
                        12,
                        2
                    ],
                    [
                        12,
                        1,
                        7
                    ],
                    [
                        3,
                        10,
                        4
                    ],
                    [
                        8,
                        3,
                        3
                    ]
                ],
                "near_win": 1,
                "free_spin_times": 10,
                "scatter_info": {
                    "id": [
                        12,
                        0
                    ],
                    "position": [
                        [
                            -1,
                            1,
                            -1
                        ],
                        [
                            -1,
                            1,
                            -1
                        ],
                        [
                            1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ],
                        [
                            -1,
                            -1,
                            -1
                        ]
                    ],
                    "amount": 3,
                    "multiplier": 1,
                    "pay_credit": 0,
                    "pay_rate": 0
                },
                "lines": [
                    {
                        "symbol_id": 12,
                        "length": 3,
                        "way": [
                            1,
                            1,
                            1
                        ],
                        "pay_credit": 10000
                    }
                ],
                "jp_type": -1,
                "jp_prize": 0
            },
            "get_sub_game": true,
            "sub_game": {
                "pay_credit_total": 1234300,
                "result": [
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                3,
                                3,
                                3
                            ],
                            [
                                5,
                                12,
                                3
                            ],
                            [
                                5,
                                5,
                                1
                            ],
                            [
                                4,
                                4,
                                1
                            ],
                            [
                                5,
                                5,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 2500,
                        "result_reels": [
                            [
                                2,
                                2,
                                3
                            ],
                            [
                                3,
                                5,
                                5
                            ],
                            [
                                12,
                                1,
                                3
                            ],
                            [
                                4,
                                4,
                                3
                            ],
                            [
                                4,
                                5,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 3,
                                "length": 4,
                                "way": [
                                    1,
                                    1,
                                    1,
                                    1
                                ],
                                "pay_credit": 2500
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                4,
                                4,
                                2
                            ],
                            [
                                3,
                                3,
                                12
                            ],
                            [
                                0,
                                3,
                                3
                            ],
                            [
                                0,
                                2,
                                2
                            ],
                            [
                                5,
                                5,
                                2
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 3,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                3,
                                3
                            ],
                            [
                                5,
                                5,
                                5
                            ],
                            [
                                4,
                                4,
                                2
                            ],
                            [
                                5,
                                5,
                                5
                            ],
                            [
                                3,
                                5,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                1,
                                1,
                                5
                            ],
                            [
                                5,
                                12,
                                3
                            ],
                            [
                                12,
                                1,
                                3
                            ],
                            [
                                5,
                                5,
                                2
                            ],
                            [
                                2,
                                2,
                                2
                            ]
                        ],
                        "near_win": 1,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 2,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                4,
                                12,
                                1
                            ],
                            [
                                2,
                                2,
                                5
                            ],
                            [
                                5,
                                5,
                                4
                            ],
                            [
                                3,
                                5,
                                5
                            ],
                            [
                                5,
                                5,
                                1
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 1800,
                        "result_reels": [
                            [
                                5,
                                3,
                                4
                            ],
                            [
                                4,
                                4,
                                4
                            ],
                            [
                                4,
                                3,
                                3
                            ],
                            [
                                3,
                                3,
                                3
                            ],
                            [
                                1,
                                5,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [
                            {
                                "symbol_id": 4,
                                "length": 3,
                                "way": [
                                    1,
                                    3,
                                    1
                                ],
                                "pay_credit": 1800
                            }
                        ],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                4,
                                4
                            ],
                            [
                                3,
                                12,
                                2
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                2,
                                5,
                                5
                            ],
                            [
                                4,
                                4,
                                1
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 1,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                2,
                                5,
                                5
                            ],
                            [
                                4,
                                4,
                                2
                            ],
                            [
                                3,
                                3,
                                5
                            ],
                            [
                                2,
                                2,
                                4
                            ],
                            [
                                5,
                                5,
                                4
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    },
                    {
                        "pay_credit_total": 0,
                        "result_reels": [
                            [
                                5,
                                4,
                                4
                            ],
                            [
                                4,
                                4,
                                4
                            ],
                            [
                                2,
                                1,
                                1
                            ],
                            [
                                1,
                                1,
                                1
                            ],
                            [
                                2,
                                5,
                                5
                            ]
                        ],
                        "near_win": 0,
                        "free_spin_times": 0,
                        "scatter_info": {
                            "id": [
                                12,
                                0
                            ],
                            "position": [
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ],
                                [
                                    -1,
                                    -1,
                                    -1
                                ]
                            ],
                            "amount": 0,
                            "multiplier": 1,
                            "pay_credit": 0,
                            "pay_rate": 0
                        },
                        "lines": [],
                        "jp_type": -1,
                        "jp_prize": 0
                    }
                ]
            },
            "get_jackpot": false,
            "jackpot": {
                "jackpot_id": "",
                "jackpot_credit": 0,
                "symbol_id": null
            },
            "get_jackpot_increment": false,
            "jackpot_increment": null,
            "grand": 0,
            "major": 0,
            "minor": 0,
            "mini": 0,
            "user_credit": 499878400,
            "bet_credit": 100000,
            "payout_credit": 14300,
            "change_credit": -85700,
            "effect_credit": 100000,
            "buy_spin": 1,
            "buy_spin_multiplier": 50,
            "extra": null
        };
        Machine.Instance.spinResponse(spinData);
        Machine.Instance.paytable.spinResult(spinData);
        Machine.Instance.paytable.end_free_game_ui(spinData['sub_game']);
    }
}

