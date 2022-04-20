require("dotenv").config({ path: "./.env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");
const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 8545
    },
    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: 5777
    },
    rinkeby: {
      provider: () => (
        new HDWalletProvider({
          providerOrUrl: `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`,
          mnemonic: process.env.MNEMONIC,
          addressIndex: 0
        })
      ),
      network_id: 4
    },
    kovan: {
      provider: () => (
        new HDWalletProvider({
          providerOrUrl: `https://kovan.infura.io/v3/${process.env.PROJECT_ID}`,
          mnemonic: process.env.MNEMONIC,
          addressIndex: 0
        })
      ),
      network_id: 42
    }
  },
  compilers: {
    solc: {
      version: "0.8.8"
    }
  }
};
