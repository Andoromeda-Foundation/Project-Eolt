component.data = function () {
    return {
        buy_amount: "1.0000 SATOKO",
        sell_amount: 0,
        balances: []
    };
};

component.created = function () {
    setInterval(() => {
        try {
            this.getBalance();
        } catch (ex) {
        }
    }, 5000);
};

component.methods = {
    getBalance: function () {
        if (app.account.name) {
            var self = this;
            app.eos.getCurrencyBalance('eosio.token', app.account.name).then(x => {
                self.balances = x;
            });
        }
    },
    getPublicKey: function () {
        return qv.get(`/api/chain/account/${app.account.name}/perm/${app.account.authority}`, {}).then(x => {
            return Promise.resolve(x.data);
        });
    },
    updateAuth: function () {
        app.notification('pending', '正在对合约账户授权');
        return this.getPublicKey()
            .then(key => {
                return app.eos.updateauth({
                    account: app.account.name,
                    permission: app.account.authority,
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
                app.notification('succeeded', '对合约账户授权成功');
                return Promise.resolve(null);
            })
            .catch(err => {
                app.notification('error', '对合约账户授权失败', err.toString());
                return Promise.reject(err);
            });
    },
    buy: function (amount) {
        this.updateAuth()
            .then(() => {
                app.notification('pending', '正在调用itegame_buy(' + amount + ')合约');
                var requiredFields = app.requiredFields;
                app.eos.contract('itegame', { requiredFields }).then(contract => {
                    console.warn(amount);
                    return contract.buy(app.account.name, amount, { authorization: [`${app.account.name}@${app.account.authority}`] });
                })
                .then(() => {
                    app.notification('succeeded', 'itegame_buy合约调用成功');
                })
                .catch((err) => {
                    app.notification('error', 'itegame_buy合约调用失败', err.toString());
                });
            });
    },
    sell: function (amount) {
        app.notification('pending', '正在调用itegame_sell(' + amount + ')合约');
        var requiredFields = app.requiredFields;
        app.eos.contract('itegame', { requiredFields }).then(contract => {
            console.log(contract);
            return contract.sell(app.account.name, parseInt(amount), { authorization: [`${app.account.name}@${app.account.authority}`] });
        })
        .then(() => {
            app.notification('succeeded', 'itegame_sell合约调用成功');
        })
        .catch((err) => {
            app.notification('error', 'itegame_sell合约调用失败', err.toString());
        });
    },
};