import React, { useEffect, useState } from 'react'
import { Card, Container, Spinner } from 'react-bootstrap'
import { useBlockchain } from '../../contexts/BlockchainContext'
import WalletConnect from '../WalletConnect'
import TokenNotListed from './TokenNotListed'
import TokenOnSale from './TokenOnSale'
import TokenSold from './TokenSold'

function TokenInteractComponent({ tokenId }) {

  const [nftDetails, setNftDetails] = useState({})
  const [tokenState, setTokenState] = useState('loading')
  const [msg, setMsg] = useState({ text: '', type: '' })

  const { account, NFTContract, MarketContract, NFTContractReader, MarketContractReader, web3Reader } = useBlockchain()

  const loadInitialDetails = async () => {
    try {
      // Fetch token owner
      let owner = await NFTContractReader.methods.ownerOf(tokenId).call()
      setNftDetails(prevDetails => ({ ...prevDetails, owner }))
      // Fetch current listing price
      let currentListingPrice = await MarketContractReader.methods.listingPrice().call()
      setNftDetails(prevDetails => ({ ...prevDetails, currentListingPrice }))
      // Fetch market item
      let details = await MarketContractReader.methods.marketItem(tokenId).call()
      setNftDetails(prevDetails => ({ ...prevDetails, ...details }))
      setTokenState(() => {
        if (details.seller === '0x0000000000000000000000000000000000000000')
          return 'not-listed'
        if (details.buyer === '0x0000000000000000000000000000000000000000')
          return 'on-sale'
        return 'sold'
      })
    } catch (err) {
      console.error(err.message)
      setMsg({ text: 'Some error occurred. Please check console for details.', type: 'danger' })
      setTokenState('error')
    }
  }

  useEffect(() => {
    if (NFTContractReader) {
      loadInitialDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [NFTContractReader])

  return (
    <div>
      {nftDetails.owner &&
        <div className='mb-4'>
          <p className='small'>Current owner: {nftDetails.owner}</p>
          <hr />
        </div>
      }
      {msg.text &&
        <Card border={msg.type} className='my-4'>
          <Card.Body className='text-center'>
            <Card.Text>{msg.text}</Card.Text>
          </Card.Body>
        </Card>
      }
      {account ?
        <>
          <div className='my-4'>
            {tokenState === 'loading' &&
              <Container className='text-center'>
                <Spinner animation='border' variant='primary' />
              </Container>
            }
            {tokenState === 'not-listed' &&
              <TokenNotListed
                web3={web3Reader}
                tokenId={tokenId}
                account={account}
                NFTContract={NFTContract}
                MarketContract={MarketContract}
                nftDetails={nftDetails}
                setNftDetails={setNftDetails}
                setTokenState={setTokenState}
                setMsg={setMsg}
              />
            }
            {tokenState === 'on-sale' &&
              <TokenOnSale
                web3={web3Reader}
                tokenId={tokenId}
                account={account}
                NFTContract={NFTContract}
                MarketContract={MarketContract}
                nftDetails={nftDetails}
                setNftDetails={setNftDetails}
                setTokenState={setTokenState}
                setMsg={setMsg}
              />
            }
            {tokenState === 'sold' &&
              <TokenSold
                web3={web3Reader}
                tokenId={tokenId}
                account={account}
                NFTContract={NFTContract}
                MarketContract={MarketContract}
                nftDetails={nftDetails}
                setNftDetails={setNftDetails}
                setTokenState={setTokenState}
                setMsg={setMsg}
              />
            }
          </div>
        </> :
        <WalletConnect />
      }
    </div>
  )
}

export default TokenInteractComponent
