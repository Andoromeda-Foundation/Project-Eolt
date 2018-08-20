app = new Vue({
    el: '#app',
    data: {
        control: {
            currentNotification: null,
            notifications: [],
            notificationLock: false
        },
        requiredFields: null,
        eos: null,
        account: null,
        user_eos_balance: null,
        user_score_balance: null,
        round_info: '准备',
        user_info: null,
        user_credits: null,
        bet_input: "100",
        deposit_input: null,
        withdraw_input: null,
        old_bet_amount: null,
        old_credits: null,
        stoping: false,
        index: 0,    //当前转动到哪个位置，起点位置
        count: 28,    //总共有多少个位置
        speed: 20,    //初始转动速度
        cycle: 20,    //转动基本次数：即至少需要转动多少次再进入抽奖环节
        timer: 0,    //setTimeout的ID，用clearTimeout清除
        times: 0,
        prize: -1,    //中奖位置
        running: false // 正在抽奖
    },
    created: function () {
    },
    watch: {
    },
    methods: {
        resolveUrl: function (to) {
            if (typeof to === 'string')
                return to;
            if (to.name && !to.path)
                return to.name;
            if (!to.query)
                return to.path;
            var baseUrl = to.path + (to.path.indexOf('?') >= 0 ? '&' : '?');
            var args = [];
            for (var x in to.query) {
                args.push(x + '=' + encodeURIComponent(to.query[x]));
            }
            return baseUrl += args.join('&');
        },
        change_bet: function () {
            play_se("se_click");
            var new_bet = parseInt(prompt("赌多少？"));
            // Check new bet
            if (new_bet > 0) {
                this.bet_input = new_bet;
            }
        },
        make_deposit: function (event) {
            play_se("se_click");
            var new_deposit = prompt("充值多少EOS？");
            // Check new deposit
            if (new_deposit > 0) {
                this.deposit(new_deposit);
            }
        },
        make_withdraw: function (event) {
            play_se("se_click");
            var new_withdraw = prompt("提现多少EOS？");
            // Check new withdraw
            if (new_withdraw > 0) {
                this.withdraw(new_withdraw);
            }
        },
        redirect: function (name, path, params, query) {
            if (name && !path)
                path = name;
            LazyRouting.RedirectTo(name, path, params, query);
        },
        notification: function (level, title, detail, button) {
            var item = { level: level, title: title, detail: detail };
            if (level === 'important') {
                item.button = button;
            }
            this.control.notifications.push(item);
            if (this.control.currentNotification && this.control.currentNotification.level === 'pending') {
                this.control.notificationLock = false;
            }
            this._showNotification(level === 'important' ? true : false);
        },
        clickNotification: function () {
            this._releaseNotification();
        },
        _showNotification: function (manualRelease) {
            var self = this;
            if (!this.control.notificationLock && this.control.notifications.length) {
                this.control.notificationLock = true;
                var notification = this.control.notifications[0];
                this.control.notifications = this.control.notifications.slice(1);
                this.control.currentNotification = notification;
                if (!manualRelease) {
                    setTimeout(function () {
                        self._releaseNotification();
                    }, 5000);
                }
            }
        },
        _releaseNotification: function () {
            var self = this;
            self.control.currentNotification = null;
            setTimeout(function () {
                self.control.notificationLock = false;
                if (self.control.notifications.length) {
                    self._showNotification();
                }
            }, 250);
        },
        balance: function () {
            this.eos.getTableRows({
                json: "true",
                code: "happyeosslot",
                scope: "happyeosslot",
                // table_key: this.account.name,
                limit: 1000,
                // lower_bound: 0,
                table: 'player'
            }).then((data) => {
                this.user_info = data.rows.find(acc => acc.account == this.account.name);
                this.user_credits = this.user_info.credits / 10000;

                var rate_100 = 25;
                var rate_50 = new Array(11, 24);
                var rate_20 = new Array(6, 16, 21);
                var rate_10 = new Array(1, 10, 26);
                var rate_5 = new Array(3, 13, 18, 22);
                var rate_2 = new Array(2, 8, 17, 28);
                var rate_0_1 = new Array(5, 9, 12, 14, 19);
                var rate_0_0_1 = new Array(4, 7, 15, 20, 23, 27);


                if (this.running) {
                    if (this.user_credits != this.old_credits) {
                        var last_rate = (this.user_credits - this.old_credits) / this.old_bet_amount;
                        if (last_rate >= 80) {
                            this.stop_at(rate_100);
                        } else if (last_rate >= 40) {
                            this.stop_at(rate_50[Math.ceil(Math.random() * 2)]);
                        } else if (last_rate >= 15) {
                            this.stop_at(rate_20[Math.ceil(Math.random() * 3)]);
                        } else if (last_rate >= 8) {
                            this.stop_at(rate_10[Math.ceil(Math.random() * 3)]);
                        } else if (last_rate >= 3) {
                            this.stop_at(rate_5[Math.ceil(Math.random() * 4)]);
                        } else if (last_rate >= 1) {
                            this.stop_at(rate_2[Math.ceil(Math.random() * 4)]);
                        } else if (last_rate >= 0.05) {
                            this.stop_at(rate_0_1[Math.ceil(Math.random() * 5)]);
                        } else if (last_rate >= 0.005) {
                            this.stop_at(rate_0_0_1[Math.ceil(Math.random() * 6)]);
                        }
                    }
                }
            }).catch((e) => {
                console.log(e);
            })
        },
        deposit: function (amount) {
            play_se("se_click");
            amount = new Number(amount).toFixed(4);
            this.notification('pending', '正在充值(' + amount + ')EOS');
            console.log(amount);
            this.eos.transfer(this.account.name, "happyeosslot", amount + " EOS", "")
                .then(() => {
                    play_se("se_buy");
                    this.notification('succeeded', '充值成功');
                })
                .catch((err) => {
                    this.notification('error', '充值失败', err.toString());
                });
        },
        withdraw: function (amount) {
            play_se("se_click");
            amount = parseInt(amount * 1000 * 10000);
            this.notification('pending', '正在兑换积分获得(' + amount + ')EOS');
            var requiredFields = this.requiredFields;
            this.eos.contract('happyeosslot', { requiredFields }).then(contract => {
                contract.sell(this.account.name, amount, { authorization: [`${this.account.name}@${this.account.authority}`] });
            })
                .then(() => {
                    play_se("se_withdraw");
                    this.notification('succeeded', '兑换成功');
                })
                .catch((err) => {
                    this.notification('error', '兑换失败', err.toString());
                });
        },
        setIdentity: function (identity) {
            this.account = identity.accounts.find(acc => acc.blockchain === 'eos');
            this.eos = scatter.eos(network, Eos, {});
            this.requiredFields = { accounts: [network] };
            this.balance(this.account.name);
        },
        init_scatter: function () {
            if (!('scatter' in window)) {
                this.notification('important', '没有找到Scatter', 'Scatter是一款EOS的Chrome插件，运行本游戏需要使用Chrome并安装Scatter插件。', '我知道了');
            } else {
                scatter.getIdentity({ accounts: [{ chainId: network.chainId, blockchain: network.blockchain }] })
                    .then(identity => {
                        this.setIdentity(identity);
                    })
                    .catch(err => {
                        this.notification('error', 'Scatter初始化失败', err.toString());
                    });
            }
        },
        roll: function () {
            var index = this.index;
            var count = this.count;
            index += 1;
            if (index > count) {
                index -= count
            }
            this.index = index;
            return false;
        },
        createHexRandom: function () {
            var num = '';
            for (i = 0; i < 64; i++) {
                var tmp = Math.ceil(Math.random() * 15);
                if (tmp > 9) {
                    switch (tmp) {
                        case (10):
                            num += 'a';
                            break;
                        case (11):
                            num += 'b';
                            break;
                        case (12):
                            num += 'c';
                            break;
                        case (13):
                            num += 'd';
                            break;
                        case (14):
                            num += 'e';
                            break;
                        case (15):
                            num += 'f';
                            break;
                    }
                } else {
                    num += tmp;
                }
            }
            return num;
        },
        start_roll: function () {
            play_se("se_click");
            if (this.running) return;
            var amount = this.bet_input;
            if (this.bet_input == "") {
                amount = 1000;
            }
            var requiredFields = this.requiredFields;
            this.eos.contract('happyeosslot', { requiredFields }).then(contract => {
                contract.bet(this.account.name, parseInt(amount * 10000), this.createHexRandom(),
                    { authorization: [`${this.account.name}@${this.account.authority}`] })
                    .then(() => {
                        play_se("se_startrolling");
                        this.running = true;
                        this.old_credits = this.user_credits - amount;
                        this.old_bet_amount = amount;
                        this.roll_loop();
                    }).catch((err) => {
                        alert(err.toString());
                    })
            })
                .then(() => {
                })
                .catch((err) => {
                    alert(err.toString());
                });
        },
        roll_loop: function () {
            play_se("se_rolling");
            this.times += 1;
            this.roll();
            if (this.times > this.cycle + 10 && this.prize == this.index) {
                clearTimeout(this.timer);
                this.prize = -1;
                this.times = 0;
                this.running = false;
            } else {
                if (this.times < this.cycle) {
                    if (this.speed > 200) {
                        this.speed -= 100;
                    } else {
                        this.speed -= 10;
                    }
                } else {
                    if (this.prize != -1) {
                        if (this.times > this.cycle + 10 && ((this.prize == 1 && this.index == this.count) || this.prize == this.index + 1)) {
                            this.speed += 110;
                        } else {
                            this.speed += 20;
                        }
                    } else {
                        this.balance();
                        console.log("balancing");
                    }
                }
                if (this.speed < 40) {
                    this.speed = 40;
                };
                if (this.speed > 500) {
                    this.speed = 500;
                }
                this.timer = setTimeout(this.roll_loop, this.speed);//循环调用
            }
        },
        stop_at: function (stop_position) {
            console.log("time to stop");
            if (this.prize == -1) {
                this.prize = stop_position
            }
        },
    },
    computed: {
    }
});

async function requestId() {
    if (!('scatter' in window)) {
        alert("你需要Scatter来玩这个游戏");
    } else {
        const identity = await scatter.getIdentity({ accounts: [{ chainId: network.chainId, blockchain: network.blockchain }] });
        app.account = identity.accounts.find(acc => acc.blockchain === 'eos');
        scatter.getIdentity({ accounts: [{ chainId: network.chainId, blockchain: network.blockchain }] });
        app.setIdentity(identity);
    }
};

