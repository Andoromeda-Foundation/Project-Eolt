app = new Vue({
    router: router,
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
        chainId: null
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
        init_scatter: function () {
            if (!('scatter' in window)) {
                app.notification('important', '没有找到Scatter', 'Scatter是一款EOS的Chrome插件，运行本例程需要使用Chrome并安装Scatter插件。', '我知道了');
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
                    app.notification('error', 'Scatter初始化失败', err.toString());
                });
        },
    },
    computed: {
    }
});