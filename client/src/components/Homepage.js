import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useBlockchain } from '../contexts/BlockchainContext'
import NftCard from './NftCard'

function Homepage() {

  const [filter, setFilter] = useState('all')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const { MarketContractReader, NFTContractReader } = useBlockchain()

  const loadItems = async () => {
    try {
      let events = (await MarketContractReader.getPastEvents('MarketItemCreated', { fromBlock: 0 })).reverse()
      events = events.reduce((acc, curr) => {
        let currTokenId = curr.returnValues.tokenId
        if (!acc.find(e => e.returnValues.tokenId === currTokenId)) {
          acc.push(curr)
        }
        return acc
      }, [])
      let createdItems = await Promise.all(events.map(async e => {
        let tokenId = e.returnValues.tokenId
        let tokenUri = await NFTContractReader.methods.tokenURI(tokenId).call()
        let metadata = await axios.get(tokenUri)
        let res = await MarketContractReader.methods.marketItem(tokenId).call()
        if (res.seller === '0x0000000000000000000000000000000000000000') {
          return { type: 'not-listed' }
        }
        else {
          return {
            ...res,
            name: metadata.data.name,
            description: metadata.data.description,
            image: metadata.data.image,
            type: (res.buyer === '0x0000000000000000000000000000000000000000' ? 'on-sale' : 'sold'),
          }
        }
      }))
      setItems(createdItems.filter(i => i.type !== 'not-listed'))
      setLoaded(true)
    } catch (err) {
      console.error(err.message)
      setError('Some error occurred while fetching market items. Please check console for details.')
      setLoaded(true)
    }
  }

  useEffect(() => {
    if (MarketContractReader) {
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MarketContractReader])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  return (
    <div>
      <h2>Artista - NFT Marketplace</h2>
      <Form onChange={handleFilterChange}>
        <Form.Group className='mt-4 mb-4'>
          <Form.Check
            inline
            defaultChecked
            type='radio'
            name='group'
            label='All'
            value='all'
            id='filter-all'
          />
          <Form.Check
            inline
            type='radio'
            name='group'
            label='On sale'
            value='on-sale'
            id='filter-on-sale'
          />
          <Form.Check
            inline
            type='radio'
            name='group'
            label='Sold out'
            value='sold'
            id='filter-sold'
          />
        </Form.Group>
      </Form>
      <Card>
        <Container className='p-4 text-center'>
          {loaded ?
            error ?
              <Card.Text className='text-danger'>{error}</Card.Text> :
              items.length ?
                <Row xs={1} sm={2} md={3} lg={4} className='g-4'>
                  {items.filter(i => {
                    if (filter === 'on-sale') return i.type === 'on-sale'
                    else if (filter === 'sold') return i.type === 'sold'
                    else return true
                  }).map(i => (
                    <Col key={i.tokenId}>
                      <NftCard
                        tokenId={i.tokenId}
                        name={i.name}
                        description={i.description}
                        image={i.image}
                        price={i.price}
                        type={i.type}
                      />
                    </Col>
                  ))}
                </Row> :
                <Card.Text className='text-muted'>No items to display</Card.Text> :
            <Spinner animation='border' variant='primary' />
          }
        </Container>
      </Card>
    </div>
  )
}

export default Homepage
