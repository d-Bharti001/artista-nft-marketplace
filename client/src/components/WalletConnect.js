import React, { useState } from 'react'
import { Button, Card } from 'react-bootstrap'
import { useBlockchain } from '../contexts/BlockchainContext'

function WalletConnect() {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { connectMetamask, account } = useBlockchain()

  const handleClick = () => {
    if (!account) {
      setLoading(true)
      setError('')
      connectMetamask().catch((err) => {
        console.error(err.message)
        setError(`Some error occurred: ${err.message}`)
        setLoading(false)
      })
    }
  }

  return (
    <Card>
      <Card.Body className='text-center'>
        {error &&
          <Card.Text className='text-danger'>
            {error}
          </Card.Text>
        }
        <Button variant='outline-primary' onClick={handleClick} disabled={loading} style={{ display: 'block', margin: 'auto' }}>
          {account ? 'Connected' : 'Connect Metamask'}
        </Button>
      </Card.Body>
    </Card>
  )
}

export default WalletConnect
