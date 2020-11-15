var HDWalletProvider = require("truffle-hdwallet-provider");
const mnemonic =
  "sausage pottery razor seven rare lounge space relief grape liquid alley lion";

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 1,
    },
  },
  networks: {
    development: {
      host: "localhost",
      network_id: "*",
      port: 7545,
      provider: function () {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 5);
      },
    },
    kovan: {
      confirmations: 2,
      gas: 4200000,
      gasPrice: 20000000000,
      network_id: 42,
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
  },
};
