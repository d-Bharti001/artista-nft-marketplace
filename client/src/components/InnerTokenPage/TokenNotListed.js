import React, { useRef, useState } from 'react'
import { Button, FormControl, FormLabel, OverlayTrigger, Popover } from 'react-bootstrap'

function TokenNotListed(props) {

  const priceInput = useRef()
  const [loading, setLoading] = useState(false)

  const handleCreateMarketItem = async () => {
    setLoading(true)
    let approvedAddr = await props.NFTContract.methods.getApproved(props.tokenId).call()
    let marketAddr = props.MarketContract.options.address
    if (approvedAddr.toLowerCase() === marketAddr.toLowerCase()) {
      props.setMsg({
        text: `The Market contract is already approved. You just need to confirm the transaction
        to pay the listing fee and start the sale. Please confirm and wait for the transaction to complete.`,
        type: 'info'
      })
    }
    else {
      props.setMsg({
        text: `Please confirm the transaction to approve your token to the Market contract,
        and wait for it to complete.`,
        type: 'info'
      })
      try {
        let tx = await props.NFTContract.methods.approve(marketAddr, props.tokenId).send({ from: props.account })
        console.log('Approve transaction', tx)
        props.setMsg({
          text: `Now please confirm the transaction to pay the listing fee and start the sale,
          and wait for it to complete.`,
          type: 'info'
        })
      } catch (err) {
        console.error('Approval error', err.message)
        props.setMsg({
          text: `Some error occurred while approving. Please check console for details.`,
          type: 'danger'
        })
        setLoading(false)
        return
      }
    }
    try {
      let price = props.web3.utils.toWei(priceInput.current.value)
      let tx = await props.MarketContract.methods.createMarketItem(props.tokenId, price)
        .send({ from: props.account, value: props.nftDetails.currentListingPrice })
      console.log('Sale transaction', tx)
      props.setMsg({
        text: `Congratulations! you have successfully listed your item on the marketplace.`,
        type: 'info'
      })
      let marketItem = await props.MarketContract.methods.marketItem(props.tokenId).call()
      props.setNftDetails(prevDetails => ({ ...prevDetails, ...marketItem }))
      props.setTokenState('on-sale')
    } catch (err) {
      console.error('Sale start error', err.message)
      props.setMsg({
        text: `Some error occurred while starting the sale. Please check console for details.`,
        type: 'danger'
      })
      setLoading(false)
    }
  }

  return (
    <div className='mb-4'>
      {props.nftDetails.owner.toLowerCase() === props.account.toLowerCase() ?
        <>
          <p className='text-secondary small'>
            Define a selling price for the token, and click the button to approve the token
            to the market contract and start the sale.
          </p>
          <FormLabel>Price in Ethers</FormLabel>
          <FormControl
            type='number'
            disabled={loading}
            defaultValue={1}
            ref={priceInput}
          />
          <p className='my-4 small'>
            Listing price: {props.web3.utils.fromWei(props.nftDetails.currentListingPrice) + ' ETH '}
            <OverlayTrigger
              overlay={
                <Popover>
                  <Popover.Body>
                    You have to deposit this fee to list your item on the marketplace.
                    It will be paid to the owner when someone buys your item. However,
                    if your item is not sold, you can take this fee back by de-listing your item anytime.
                  </Popover.Body>
                </Popover>
              }
            >
              <i className='bi bi-info-circle'></i>
            </OverlayTrigger>
          </p>
          <Button
            disabled={loading}
            onClick={handleCreateMarketItem}
          >
            Approve & Start Sale
          </Button>
        </> :
        <p className='mt-5 text-center'>Item has not been listed for sale</p>
      }
    </div>
  )
}

export default TokenNotListed
