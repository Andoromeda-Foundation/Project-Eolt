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
        network: null,
        account: null,
        chainId: null,
        user_eos_balance: null,
        user_score_balance: null
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
            this.eos
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
        getPublicKey: function () {
            return qv.get(`/api/chain/account/${this.account.name}/perm/${this.account.authority}`, {})
            .then(x => {
                return Promise.resolve(x.data);
            });
        },
        updateAuth: function () {
            this.notification('pending', '正在对合约账户授权');
            return this.getPublicKey()
                .then(key => {
                    return this.eos.updateauth({
                        account: this.account.name,
                        permission: this.account.authority,
                        parent: "owner",
                        auth: {
                            "threshold": 1,
                            "keys": [{
                                "key": key,
                                "weight": 1
                            }],
                            "accounts": [{
                                "permission": {
                                    "actor": "itegame",
                                    "permission": "eosio.code"
                                },
                                "weight": 1
                            }]
                        }
                    });
                })
                .then(() => {
                    this.notification('succeeded', '对合约账户授权成功');
                    return Promise.resolve(null);
                })
                .catch(err => {
                    this.notification('error', '对合约账户授权失败', err.toString());
                    return Promise.reject(err);
                });
        },
        deposit: function (amount) {
            this.updateAuth()
                .then(() => {
                    this.notification('pending', '正在充值(' + amount + ')EOS');
                    var requiredFields = this.requiredFields;
                    this.eos.contract('itegame', { requiredFields }).then(contract => {
                        console.warn(amount);
                        return contract.buy(this.account.name, amount, { authorization: [`${this.account.name}@${this.account.authority}`] });
                    })
                    .then(() => {
                        this.notification('succeeded', '充值成功');
                    })
                    .catch((err) => {
                        this.notification('error', '充值成功', err.toString());
                    });
                });
        },
        withdraw: function (amount) {
            this.notification('pending', '正在兑换积分获得(' + amount + ')EOS');
            var requiredFields = this.requiredFields;
            this.eos.contract('itegame', { requiredFields }).then(contract => {
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
            }

            var self = this;
            qv.get('/api/chain/id')
                .then(x => {
                    self.chainId = x.data;
                    self.network = {
                        blockchain: 'eos',
                        host: '127.0.0.1',
                        port: 8888,
                        protocol: 'http',
                        chainId: self.chainId,
                        verbose: true,
                        debug: true
                    };
                    scatter.getIdentity({ accounts: [self.network] }).then(identity => {
                        self.account = identity.accounts.find(acc => acc.blockchain === 'eos');
                        self.eos = scatter.eos(self.network, Eos, {});
                        self.requiredFields = { accounts: [self.network] };
                    });
                })
                .catch(err => {
                    this.notification('error', 'Scatter初始化失败', err.toString());
                });
        },
    },
    computed: {
    }
});
