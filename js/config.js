/* jshint esversion: 6 */ 
var ENV = 'dev';
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
        host: 'api.eosnewyork.io',
        port: 443,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        protocol: "https"
    };

    options = {
        broadcast: true,
        sign: true,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        httpEndpoint: "https://api.eosnewyork.io:443"
    };
} else {
    throw("network config error");
}

function setENV(env){
    ENV = env;
}

export default {
    appName: "eos dapp",
    mainToken: "EOS", // 主网代币，永远是EOS, 不会变
    tokenName: "CGT", // 游戏代币，游戏盘是 ITE， EOS盘是EOS
    tokenContract: "eosio.token",
    gameContract: "oneplayeriss",
    
    version: "1.0",
    env: ENV,
    eosNetwork: network,
    eosOptions: options,
    setNetwork: setENV
};
