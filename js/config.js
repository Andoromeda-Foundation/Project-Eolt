/* jshint esversion: 6 */
var ENV = 'mainnet';
var network;

if (ENV === 'dev') {
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
} else if (ENV === 'testnet') {
    // remote testnet
    network = {
        blockchain: 'eos',
        host: 'api-kylin.eoslaomao.com',
        port: 443,
        chainId: "5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191",
        protocol: "https"
    };
} else if (ENV === 'mainnet') {
    // mainnet
    network = {
        blockchain: 'eos',
        host: 'api.superone.io',
        host_list: [
            'api.superone.io',
            "api2.acroeos.one",
            "api.main.alohaeos.com",
            "api.eosargentina.io",
            "eosbp.atticlab.net",
            "mainnet.genereos.io",
            "api-eos.blckchnd.com",
            "node1.blockgenesys.com",
            "eosapi.blockmatrix.network",
            "api.eosio.cr",
            "bp.cryptolions.io",
            "api.cypherglass.com",
            "nodes.eos42.io",
            "api.dpos.africa",
            "mainnet.eosamsterdam.net",
            "publicapi-mainnet.eosauthority.com",
            "api.eosbeijing.one",
            "mainnet.eoscalgary.io",
            "api.eoscleaner.com",
            "eu.eosdac.io",
            "api1.eosdublin.io",
            "filter.eoseco.com",
            "user-api.eoseoul.io",
            "api.bp.fish",
            "node.eosflare.io",
            "api.bitmars.one",
            "eos.genesis-mining.com",
            "api.eosdetroit.io",
            "mainnet.meet.one",
            "mainnet-history.meet.one",
            "api.eoslaomao.com",
            "api2.eosmetal.io",
            "api.eosn.io",
            "api.eosnewyork.io",
            "api.main-net.eosnodeone.io",
            "eosapi.nodepacific.com",
            "node1.eosphere.io",
            "node2.eosphere.io",
            "hapi.eosrio.io",
            "api.eosrio.io",
            "api.eossweden.se",
            "api2.eostribe.io",
            "api.eosuk.io",
            "api.eoswonders.com",
            "api.franceos.fr",
            "api.helloeos.com.cn",
            "api.hkeos.com",
            "api.jeda.one",
            "api.oraclechain.io",
            "api.proxy1a.sheos.org",
            "api.eosgeneva.io",
            "eos.greymass.com",
            "api.tokenika.io"
        ],
        port: 443,
        chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        protocol: "https"
    };
} else {
    throw ("network config error");
}