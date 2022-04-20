import React from 'react'
import { Button, Modal } from 'react-bootstrap'

function About({ show, handleClose }) {
  return (
    <Modal size='lg' centered fullscreen='md-down' show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Artista</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>A marketplace for images and paintings</h6>
        <p>
          NFT name: Artista<br />
          NFT symbol: ART<br />
          Based on ERC721
        </p>
        <p>
          Pages:<br />
          Homepage: View all the items (on sale and sold out)<br />
          Your items: View the items you created and also those which you've bought<br />
          Create item: Create a new NFT
        </p>
        <p>
          For more details, view this project on{' '}
          <a
            href='https://github.com/d-Bharti001/artista-nft-marketplace'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='primary' size='sm' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default About
