/* jshint esversion: 6 */ 
var ENV = 'mainnet';
var network;
var options;

if(ENV === 'dev'){
    // local testnet
    network = {
        blockchain: 'eos',
        host: '127.0.0.1',
        port: 8888,
        protocol: 'http',
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
        verbose: true,
        debug: true,
    };
    options = {
        broadcast: true,
        sign: true,
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
        httpEndpoint: "http://127.0.0.1:8888"
    };
} else if(ENV === 'testnet'){
    // remote testnet
    network = {
        blockchain: 'eos',
        host: '120.27.237.92',
        port: 8888,
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
        protocol: "http"
    };
    options = {
        broadcast: true,
        sign: true,
        chainId: "cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f",
        httpEndpoint: "http://120.27.237.92:8888"
    };
} else if( ENV === 'mainnet'){
    // mainnet
    network = {
        blockchain: 'eos',
        host: 'api-direct.eosasia.one',
        port: 80,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        protocol: "http"
    };

    options = {
        broadcast: true,
        sign: true,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        httpEndpoint: "http://api-direct.eosasia.one:80"
    };
} else {
    throw("network config error");
}

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