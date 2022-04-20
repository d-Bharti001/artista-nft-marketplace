import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import { Card, Col, Container, Row } from 'react-bootstrap'
import { useBlockchain } from '../../contexts/BlockchainContext'
import TokenInteractComponent from './TokenInteractComponent'

function InnerTokenPage() {

  const [tokenId, setTokenId] = useState()
  const [tokenDetails, setTokenDetails] = useState()
  const [tokenState, setTokenState] = useState('loading')

  const { NFTContractReader } = useBlockchain()
  const [searchParams,] = useSearchParams()

  const fetchTokenDetails = async () => {
    try {
      let tokenCreator = await NFTContractReader.getPastEvents('Transfer', {
        fromBlock: 0,
        filter: { from: '0x0000000000000000000000000000000000000000', tokenId }
      }).then(events => events[0].returnValues.to)
      let tokenUri = await NFTContractReader.methods.tokenURI(tokenId).call()
      let metadata = await axios.get(tokenUri)
      setTokenDetails({
        tokenId,
        tokenCreator,
        tokenUri,
        name: metadata.data.name,
        description: metadata.data.description,
        image: metadata.data.image,
      })
      setTokenState('loaded')
    } catch (err) {
      console.error(err.message)
      setTokenState('invalid')
    }
  }

  useEffect(() => {
    let givenId = searchParams.get('tokenId')
    if (!givenId) {
      setTokenId('invalid')
    } else {
      setTokenId(givenId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (tokenId && tokenId !== 'invalid' && NFTContractReader) {
      fetchTokenDetails()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, NFTContractReader])

  return (
    <div>
      <Card>
        <Card.Body className='text-center'>
          {tokenId === 'invalid' ?
            <Card.Text>
              Token ID not provided!
            </Card.Text> :
            tokenState === 'loading' ?
              <Card.Text className='text-muted'>Loading...</Card.Text> :
              tokenState === 'invalid' ?
                <Card.Text className='text-danger'>
                  Token seems to be invalid. Check console for error details.
                </Card.Text> :
                <Container className='text-start'>
                  <Row xs={1} sm={1} md={2} className='g-4'>
                    <Col>
                      <div className='text-center my-4' height={400}>
                        <img
                          src={tokenDetails.image}
                          alt='NFT'
                          className='img-fluid mx-auto d-block'
                          style={{
                            objectFit: 'contain',
                            maxHeight: 400,
                            border: 'grey 1px solid'
                          }}
                        />
                      </div>
                      <div className='my-4'>
                        <p className='small'>
                          <a
                            title='View on IPFS'
                            href={tokenDetails.tokenUri}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            ART #{tokenDetails.tokenId}
                            <i className='bi bi-box-arrow-up-right ms-2'></i>
                          </a>
                        </p>
                        <h4>{tokenDetails.name}</h4>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{tokenDetails.description}</p>
                      </div>
                    </Col>
                    <Col>
                      <div className='mt-4'>
                        <p className='small'>Created by: {tokenDetails.tokenCreator}</p>
                      </div>
                      <div className='mb-4'>
                        <TokenInteractComponent tokenId={tokenDetails.tokenId} />
                      </div>
                    </Col>
                  </Row>
                </Container>
          }
        </Card.Body>
      </Card>
    </div>
  )
}

export default InnerTokenPage
