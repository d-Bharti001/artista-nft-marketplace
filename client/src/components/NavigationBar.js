import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Container, Nav, Navbar } from 'react-bootstrap'
import About from './About'

function NavigationBar() {

  const [showAbout, setShowAbout] = useState(false)

  const handleAboutOpen = () => {
    setShowAbout(true)
  }

  const handleAboutClose = () => {
    setShowAbout(false)
  }

  return (
    <>
      <Navbar collapseOnSelect bg='dark' variant='dark' expand='md' fixed='top' className='shadow'>
        <Container>
          <Navbar.Brand>Artista</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              <Nav.Link as={RouterLink} to='/'>
                <i className='bi bi-house-door'></i> Home
              </Nav.Link>
              <Nav.Link as={RouterLink} to='/my-items'>
                <i className='bi bi-person-circle'></i> Your items
              </Nav.Link>
              <Nav.Link as={RouterLink} to='/create-new'>
                <i className='bi bi-plus-circle-dotted'></i> Create item
              </Nav.Link>
              <Nav.Link onClick={handleAboutOpen}>
                <i className='bi bi-info-circle'></i> About
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <About show={showAbout} handleClose={handleAboutClose} />

      <div className='m-5'><br /></div>
    </>
  )
}

export default NavigationBar
