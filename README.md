# Project-Eolt

## 相關地址

* 游戏官网：[happyeosslot.com](happyeosslot.com)
* 合约地址：https://link.zhihu.com/?target=https%3A//www.myeoskit.com/%23/tx/happyeosslot
* 合约代码：https://github.com/Andoromeda-Foundation/dapp-examples/blob/master/Contracts/EOS/slot_machine/slot_machine.cpp
* 前端代码：https://Andoromeda-Foundation/Project-Eolt

## Setup

### 安装依赖
    npm install

### 启动项目
    npm start

**注意** 在测试的时候，需要手动清理浏览器缓存，才能应用更改！

### 在浏览器run
http://localhost:5000/

### 在线浏览
https://andoromeda-foundation.github.io/Project-Eolt/

### EOS node setup

    #NODEOS
    alias nodeos=/usr/local/eosio/bin/nodeos

    #CLEOS
    alias cleos=/usr/local/eosio/bin/cleos

    #KEOSD
    alias keosd=/usr/local/eosio/bin/keosd

    # EOSIOCPP
    alias eosiocpp=/usr/local/eosio/bin/eosiocpp


    nodeos -e -p eosio --plugin eosio::chain_api_plugin \
        --plugin eosio::history_api_plugin \
        --http-server-address 127.0.0.1:8888 \
        --hard-replay-blockchain \
        --http-alias localhost:8888

    keosd --config-dir ~/eos-wallet --wallet-dir ~/eos-wallet --http-server-address 127.0.0.1:8900 --http-alias localhost:8900

    cleos wallet create
    
    cleos wallet import --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3

    happyeosslot

Save password to use in the future to unlock this wallet.
Without password imported keys will not be retrievable.
 "PW5Jan36YgE4yNhk1ZeWH5b2r3ti2LJorFWV5x3yDPK1Vj1Akd6mM"
 
## Tools
* 查询玩家余额

       cleos -u https://api.eosnewyork.io:443 get table happyeosslot happyeosslot player
    
* 查询当前玩家的投注

       cleos -u https://api.eosnewyork.io:443 get table happyeosslot happyeosslot offer

## 合約的資料結構和開發細語
form : https://zhuanlan.zhihu.com/p/42410021

合约中有三张 table，

* global 记录全局信息，如游戏当前 seed。
* player 记录玩家的信息，每个玩家的筹码。
* order 记录每个玩家下注的队列。

每当后台检测到有玩家下注，我们就调用一次 reveal 方法，清空当前 order 队列，并顺便设置下一局游戏的 seed。

最后说一下这个游戏的风险，理论上，游戏官方作为最后一步揭示 seed 的参与者，是可以提前预测到 roll 出的结果的，因此可以拒绝开奖或者大量作弊套现离场。另一种可能是虽然玩家 roll 到 100 倍的 BTC 是小概率事件（我们自己测试的时候第一把就 roll 到了 btc，我们还一度以为是合约的 bug。。。），但是一旦发生可能会造成短时间内产生大量挤兑，导致合约入不敷出。
