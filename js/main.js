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
        index: 0,    //当前转动到哪个位置，起点位置
        count: 28,    //总共有多少个位置
        speed: 20,    //初始转动速度
        cycle: 3,    //转动基本次数：即至少需要转动多少次再进入抽奖环节
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
        refreshBalance: function () {
            this.user_eos_balance = "12345";
            this.user_score_balance = "54321";
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
        deposit: function (amount) {
            this.notification('pending', '正在充值(' + amount + ')EOS');
            var requiredFields = this.requiredFields;
            this.eos.transfer(this.account.name, option.deposit_account, `${amount}.0000 EOS`, "")
                .then(() => {
                    this.notification('succeeded', '充值成功');
                })
                .catch((err) => {
                    this.notification('error', '充值失败', err.toString());
                });
        },
        withdraw: function (amount) {
            this.notification('pending', '正在兑换积分获得(' + amount + ')EOS');
            var requiredFields = this.requiredFields;
            this.eos.contract('happyeosslot', { requiredFields }).then(contract => {
                console.log(contract);
                return contract.sell(this.account.name, parseInt(amount), { authorization: [`${this.account.name}@${this.account.authority}`] });
            })
                .then(() => {
                    this.notification('succeeded', '兑换成功');
                })
                .catch((err) => {
                    this.notification('error', '兑换失败', err.toString());
                });
        },
        init_scatter: function () {
            if (!('scatter' in window)) {
                this.notification('important', '没有找到Scatter', 'Scatter是一款EOS的Chrome插件，运行本游戏需要使用Chrome并安装Scatter插件。', '我知道了');
            } else {
                var self = this;
                scatter.getIdentity({ accounts: [network] })
                    .then(identity => {
                        self.account = identity.accounts.find(acc => acc.blockchain === 'eos');
                        self.eos = scatter.eos(network, Eos, {});
                        self.requiredFields = { accounts: [network] };
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
        start_roll: function () {
            if (this.running) return;
            this.running = true;
            this.roll_loop();
        },
        roll_loop: function () {
            this.times += 1;
            this.roll();
            if (this.times > this.cycle + 10 && this.prize == this.index) {
                clearTimeout(this.timer);
                this.prize = -1;
                this.times = 0;
                this.running = false;
            } else {
                if (this.times < this.cycle) {
                    this.speed -= 10;
                } else {
                    if (this.prize != -1) {
                        if (this.times > this.cycle + 10 && ((this.prize == 1 && this.index == this.count) || this.prize == this.index + 1)) {
                            this.speed += 110;
                        } else {
                            this.speed += 20;
                        }
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
            this.prize = stop_position
        },
    },
    computed: {
    }
});
