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
            lottery.init("lottery");
        },
    },
    computed: {
    }
});

var lottery={
    index:-1,    //当前转动到哪个位置，起点位置
    count:0,    //总共有多少个位置
    speed:20,    //初始转动速度
    cycle:100,    //转动基本次数：即至少需要转动多少次再进入抽奖环节
    timer:0,    //setTimeout的ID，用clearTimeout清除
    prize:-1,    //中奖位置
    running: false, // 正在抽奖
    init:function(id){
        if ($("#"+id).find(".img-box").length>0) {
            $lottery = $("#"+id);
            $units = $lottery.find(".lottery-unit");
            this.obj = $lottery;
            this.count = $units.length;
            $lottery.find(".lottery-unit-"+this.index).addClass("active");
        };
    },
    roll:function(){
        var index = this.index;
        var count = this.count;
        var lottery = this.obj;
        $(lottery).find(".lottery-unit-"+index).removeClass("active");
        index += 1;
        if (index>count-1) {
            index = 0;
        };
        $(lottery).find(".lottery-unit-"+index).addClass("active");
        this.index=index;
        return false;
    },
    stop:function(index){
        this.prize=index;
        return false;
    }
};

function roll_cycle(){
    lottery.times += 1;
    lottery.roll();  //转动过程调用的是lottery的roll方法，这里是第一次调用初始化
    if (lottery.times > lottery.cycle+10 && lottery.prize==lottery.index) {
        clearTimeout(lottery.timer);
        lottery.prize=-1;
        lottery.times=0;
        lottery.running = false;
    }else{
        if (lottery.times<lottery.cycle) {
            lottery.speed -= 10;
        }else{
            if (lottery.prize != -1) {
                if (lottery.times > lottery.cycle+10 && ((lottery.prize==0 && lottery.index==7) || lottery.prize==lottery.index+1)) {
                    lottery.speed += 110;
                }else{
                    lottery.speed += 20;
                }
            }
        }
        if (lottery.speed<40) {
            lottery.speed=40;
        };
        //console.log(lottery.times+'^^^^^^'+lottery.speed+'^^^^^^^'+lottery.prize);
        lottery.timer = setTimeout(roll,lottery.speed);//循环调用
    }
}

function start_role() {
    lottery.running = true;
    roll_cycle();
}
