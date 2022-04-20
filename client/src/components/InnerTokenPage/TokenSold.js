import React from 'react'

function TokenSold(props) {
  return (
    <div className='my-5'>
      <p>
        <span className='h5'>
          Sold for:{' '}
        </span>
        <span className='h3'>
          {props.web3.utils.fromWei(props.nftDetails.price.toString())} ETH
        </span>
      </p>
      <p className='small'>Sold by: {props.nftDetails.seller}</p>
      <p className='small'>Bought by: {props.nftDetails.buyer}</p>
    </div>
  )
}

export default TokenSold
