import React, { Component, createContext, useContext } from 'react'
import Web3 from 'web3'
import NFT from '../contracts/NFT.json'
import Market from '../contracts/Market.json'
require('dotenv').config({ path: '../../.env.local' })

const networks = {
  '1': 'Ethereum Main Network',
  '3': 'Ropsten Test Network',
  '4': 'Rinkeby Test Network',
  '5': 'Goerli Test Network',
  '42': 'Kovan Test Network',
  '5777': 'Local Ganache Network',
}

const expectedNetworkId = '5'

const BlockchainContext = createContext()

export function useBlockchain() {
  return useContext(BlockchainContext)
}

class BlockchainProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      web3Reader: null,
      NFTContractReader: null,
      MarketContractReader: null,
      web3: null,
      NFTContract: null,
      MarketContract: null,
      metamask: null,
      account: null,
    }
  }

  componentDidMount() {
    let endpoint
    switch (expectedNetworkId) {
      case '1':
        endpoint = `https://mainnet.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`
        break
      case '3':
        endpoint = `https://ropsten.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`
        break
      case '4':
        endpoint = `https://rinkeby.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`
        break
      case '5':
        endpoint = `https://goerli.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`
        break
      case '42':
        endpoint = `https://kovan.infura.io/v3/${process.env.REACT_APP_PROJECT_ID}`
        break
      default:
        endpoint = `http://localhost:7545`
        break
    }
    let web3Instance = new Web3(new Web3.providers.HttpProvider(endpoint))
    let nftInstance = new web3Instance.eth.Contract(NFT.abi, NFT.networks[expectedNetworkId].address)
    let marketInstance = new web3Instance.eth.Contract(Market.abi, Market.networks[expectedNetworkId].address)
    this.setState({
      web3Reader: web3Instance,
      NFTContractReader: nftInstance,
      MarketContractReader: marketInstance,
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.metamask && this.state.metamask !== prevState.metamask) {
      this.state.metamask.on('chainChanged', this.resetState)
      this.state.metamask.on('accountsChanged', this.handleAccountChanged)
      this.state.metamask.on('disconnect', this.resetState)
    }
  }

  componentWillUnmount() {
    if (this.state.metamask) {
      this.state.metamask.removeListener('chainChanged', this.resetState)
      this.state.metamask.removeListener('accountsChanged', this.handleAccountChanged)
      this.state.metamask.removeListener('disconnect', this.resetState)
    }
  }

  resetState = () => {
    window.web3 = undefined
    this.setState({
      web3: null,
      NFTContract: null,
      MarketContract: null,
      metamask: null,
      account: null,
    })
  }

  handleAccountChanged = (accounts) => {
    this.setState({ account: accounts[0] })
  }

  connectMetamask = async () => {
    let { ethereum } = window
    if (ethereum && ethereum.isMetaMask) {
      let selectedNetwork = await ethereum.request({ method: 'net_version' })
      if (selectedNetwork !== expectedNetworkId) {
        throw new Error(`Please switch to ${networks[expectedNetworkId]}`)
      }
      let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      let web3Instance = new Web3(ethereum)
      let nftInstance = new web3Instance.eth.Contract(NFT.abi, NFT.networks[expectedNetworkId].address)
      let marketInstance = new web3Instance.eth.Contract(Market.abi, Market.networks[expectedNetworkId].address)
      window.web3 = web3Instance
      this.setState({
        web3: web3Instance,
        NFTContract: nftInstance,
        MarketContract: marketInstance,
        metamask: ethereum,
        account: accounts[0],
      })
    } else {
      throw new Error('Please install MetaMask extension')
    }
  }

  render() {
    return (
      <BlockchainContext.Provider value={{
        ...this.state,
        networkId: expectedNetworkId,
        connectMetamask: this.connectMetamask,
      }}>
        {this.props.children}
      </BlockchainContext.Provider>
    )
  }
}

export default BlockchainProvider
