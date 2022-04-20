import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap'
import { useBlockchain } from '../contexts/BlockchainContext'
import NftCard from './NftCard'
import WalletConnect from './WalletConnect'

function MyItemsPage() {

  const [filter, setFilter] = useState('all')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [myItems, setMyItems] = useState([])
  const [boughtItems, setBoughtItems] = useState([])

  const { account, NFTContract, MarketContract } = useBlockchain()

  const loadItems = async () => {
    try {
      let myItemsEvents = (await NFTContract.getPastEvents('Transfer', {
        fromBlock: 0,
        filter: {
          from: '0x0000000000000000000000000000000000000000',
          to: account.toLowerCase(),
        }
      })).reverse()
      let boughtItemsEvents = (await MarketContract.getPastEvents('MarketItemBought', {
        fromBlock: 0,
        filter: {
          buyer: account.toLowerCase(),
        }
      })).reverse()
      boughtItemsEvents = boughtItemsEvents.reduce((acc, curr) => {
        let currTokenId = curr.returnValues.tokenId
        if (!acc.find(e => e.returnValues.tokenId === currTokenId)) {
          acc.push(curr)
        }
        return acc
      }, [])
      let myItemsRes = await Promise.all(myItemsEvents.map(async e => {
        let tokenId = e.returnValues.tokenId
        let tokenUri = await NFTContract.methods.tokenURI(tokenId).call()
        let metadata = await axios.get(tokenUri)
        let res = await MarketContract.methods.marketItem(tokenId).call()
        res.tokenId = tokenId
        res.name = metadata.data.name
        res.description = metadata.data.description
        res.image = metadata.data.image
        if (res.seller === '0x0000000000000000000000000000000000000000') {
          res.type = 'not-listed'
        } else {
          if (res.buyer === '0x0000000000000000000000000000000000000000') {
            res.type = 'on-sale'
          }
          else {
            res.type = 'sold'
          }
        }
        return res
      }))
      let boughtItemsRes = await Promise.all(boughtItemsEvents.map(async e => {
        let tokenId = e.returnValues.tokenId
        let tokenUri = await NFTContract.methods.tokenURI(tokenId).call()
        let metadata = await axios.get(tokenUri)
        let res = {
          tokenId,
          price: e.returnValues.price,
          type: 'sold',
          name: metadata.data.name,
          description: metadata.data.description,
          image: metadata.data.image,
        }
        return res
      }))
      setMyItems(myItemsRes)
      setBoughtItems(boughtItemsRes)
      setLoaded(true)
    } catch (err) {
      console.error(err.message)
      setError('Some error occurred while fetching market items. Please check console for details.')
      setLoaded(true)
    }
  }

  useEffect(() => {
    if (account) {
      setLoaded(false)
      setError('')
      loadItems()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  return (
    <div>
      <h2>My items</h2>
      <Form onChange={handleFilterChange}>
        <Form.Group className='mt-4 mb-2'>
          <Form.Check
            inline
            defaultChecked
            type='radio'
            name='group'
            label='All creations'
            value='all'
            id='filter-all'
          />
          <Form.Check
            inline
            type='radio'
            name='group'
            label='Not listed'
            value='not-listed'
            id='filter-not-listed'
          />
          <Form.Check
            inline
            type='radio'
            name='group'
            label='Sold'
            value='sold'
            id='filter-sold'
          />
          <Form.Check
            inline
            type='radio'
            name='group'
            label='Unsold'
            value='on-sale'
            id='filter-on-sale'
          />
        </Form.Group>
        <Form.Group className='mb-4'>
          <Form.Check
            inline
            type='radio'
            name='group'
            label='Bought by me'
            value='bought'
            id='filter-bought'
          />
        </Form.Group>
      </Form>
      {account ?
        <Card>
          <Container className='p-4 text-center'>
            {loaded ?
              error ?
                <Card.Text className='text-danger'>{error}</Card.Text> :
                filter === 'bought' ?
                  boughtItems.length ?
                    <Row xs={1} sm={2} md={3} lg={4} className='g-4'>
                      {boughtItems.map(i => (
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
                  myItems.length ?
                    <Row xs={1} sm={2} md={3} lg={4} className='g-4'>
                      {myItems.filter(i => {
                        if (filter === 'on-sale') return i.type === 'on-sale'
                        else if (filter === 'sold') return i.type === 'sold'
                        else if (filter === 'not-listed') return i.type === 'not-listed'
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
        </Card> :
        <WalletConnect />
      }
    </div>
  )
}

export default MyItemsPage
