import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

function TokenOnSale(props) {

  const [loading, setLoading] = useState(false)

  const buyMarketItem = async () => {
    setLoading(true)
    props.setMsg({
      text: 'Please confirm the transaction and wait for it to complete.',
      type: 'info'
    })
    try {
      let tx = await props.MarketContract.methods.buyMarketItem(props.tokenId)
        .send({ from: props.account, value: props.nftDetails.price })
      console.log(tx)
      props.setMsg({
        text: 'Congrats! You\'ve bought this item.',
        type: 'info'
      })
      let marketItem = await props.MarketContract.methods.marketItem(props.tokenId).call()
      let owner = await props.NFTContract.methods.ownerOf(props.tokenId).call()
      props.setNftDetails(prevDetails => ({ ...prevDetails, ...marketItem, owner }))
      props.setTokenState('sold')
    } catch (err) {
      console.error(err.message)
      props.setMsg({
        text: 'Some error occurred. Please check console for details.',
        type: 'danger'
      })
      setLoading(false)
    }
  }

  const delistMarketItem = async () => {
    setLoading(true)
    props.setMsg({
      text: 'Please confirm the transaction and wait for it to complete.',
      type: 'info'
    })
    try {
      let tx = await props.MarketContract.methods.delistMarketItem(props.tokenId).send({ from: props.account })
      console.log(tx)
      props.setMsg({
        text: 'Item de-listed from the marketplace, and listing fee has been refunded',
        type: 'info'
      })
      let marketItem = await props.MarketContract.methods.marketItem(props.tokenId).call()
      props.setNftDetails(prevDetails => ({ ...prevDetails, ...marketItem }))
      props.setTokenState('not-listed')
    } catch (err) {
      console.error(err.message)
      props.setMsg({
        text: 'Some error occurred. Please check console for details.',
        type: 'danger'
      })
      setLoading(false)
    }
  }

  return (
    <div className='mb-4'>
      <p style={{ marginTop: '64px' }}>
        Price:{' '}
        <span className='h3'>
          {props.web3.utils.fromWei(props.nftDetails.price.toString())} ETH
        </span>
      </p>
      <p className='small'>Sold by: {props.nftDetails.seller}</p>
      <div className='mt-4'>
        {props.nftDetails.owner.toLowerCase() === props.account.toLowerCase() ?
          <>
            <p className='small text-secondary my-5'>
              You've invested{' '}
              {props.web3.utils.fromWei(props.nftDetails.listingPrice.toString())} ETH
              to list this item on the marketplace. De-listing the item would pay you back your invested amount.
            </p>
            <Button
              disabled={loading}
              onClick={delistMarketItem}
            >
              Remove from marketplace
            </Button>
          </> :
          <div className='mt-5'>
            <Button
              size='lg'
              disabled={loading}
              onClick={buyMarketItem}
            >
              Buy
            </Button>
          </div>
        }
      </div>
    </div>
  )
}

export default TokenOnSale
