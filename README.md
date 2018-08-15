# Project-Eolt

安装依赖
npm install

启动项目
npm start

在浏览器run
http://localhost:5000/

在线浏览
https://andoromeda-foundation.github.io/Project-Eolt/


#NODEOS
alias nodeos=/usr/local/eosio/bin/nodeos
#CLEOS
alias cleos=/usr/local/eosio/bin/cleos
#KEOSD
alias keosd=/usr/local/eosio/bin/keosd
#EOSIOCPP
alias eosiocpp=/usr/local/eosio/bin/eosiocpp


nodeos -e -p eosio --plugin eosio::chain_api_plugin \
        --plugin eosio::history_api_plugin \
        --http-server-address 127.0.0.1:8888 \
        --hard-replay-blockchain \
        --http-alias localhost:8888

keosd --config-dir ~/eos-wallet --wallet-dir ~/eos-wallet --http-server-address 127.0.0.1:8900 --http-alias localhost:8900

cleos wallet create

Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
"PW5Jan36YgE4yNhk1ZeWH5b2r3ti2LJorFWV5x3yDPK1Vj1Akd6mM"

cleos wallet import --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

happyeosslot
