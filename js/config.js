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
        host: 'api-kylin.eoslaomao.com',
        port: 443,
        chainId: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
        protocol: "https"
    };
    options = {
        broadcast: true,
        sign: true,
        chainId: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
        httpEndpoint: "https://api-kylin.eoslaomao.com:443"
    };
} else if( ENV === 'mainnet') {
    // mainnet
    network = {
        blockchain: 'eos',
        host: 'api-direct.eosasia.one',
        port: 443,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        protocol: "https"
    };

    options = {
        broadcast: true,
        sign: true,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        httpEndpoint: "http://api-direct.eosasia.one:443"
    };
} else {
    throw("network config error");
}
