import React, { useEffect, useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useBlockchain } from '../contexts/BlockchainContext'

function NftCard(props) {

  const { web3Reader } = useBlockchain()
  const [buttonVariant, setButtonVariant] = useState('outline-secondary')

  useEffect(() => {
    if (props.type === 'on-sale') {
      setButtonVariant('primary')
    } else if (props.type === 'sold') {
      setButtonVariant('outline-primary')
    } else {
      setButtonVariant('outline-secondary')
    }
  }, [props])

  return (
    <Card className='text-start'>
      <div style={{ height: 260 }} className='text-center'>
        <img
          src={props.image}
          alt='NFT'
          loading='lazy'
          className='img-fluid mx-auto d-block'
          style={{ objectFit: 'contain', maxHeight: 260, borderRadius: '4px' }}
        />
      </div>
      <Card.Body>
        <Card.Text className='text-secondary small'>ART #{props.tokenId}</Card.Text>
        <Card.Title>{props.name}</Card.Title>
        <Card.Text className='small'>
          {props.description.substr(0, 100)}
          {props.description.substr(100) && '...'}
        </Card.Text>
        <Card.Text>
          {props.type !== 'not-listed' &&
            <strong>{web3Reader.utils.fromWei(props.price.toString())} ETH</strong>
          }
          <Button
            className='float-end'
            variant={buttonVariant}
            size='sm'
            href={`/token?tokenId=${props.tokenId}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {props.type === 'not-listed' && 'View'}
            {props.type === 'on-sale' && 'On sale'}
            {props.type === 'sold' && 'Sold'}
            <i className='bi bi-box-arrow-up-right ms-2'></i>
          </Button>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default NftCard
