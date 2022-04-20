import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { Container } from 'react-bootstrap'
import BlockchainProvider from './contexts/BlockchainContext'
import NavigationBar from './components/NavigationBar'
import Homepage from './components/Homepage'
import MyItemsPage from './components/MyItemsPage'
import CreateTokenPage from './components/CreateTokenPage'
import InnerTokenPage from './components/InnerTokenPage/InnerTokenPage'

function App() {
  return (
    <div className='App'>
      <BlockchainProvider>
        <Router>
          <NavigationBar />
          <Container className='mb-5'>
            <Routes>
              <Route path='/' element={<Homepage />} />
              <Route path='my-items' element={<MyItemsPage />} />
              <Route path='create-new' element={<CreateTokenPage />} />
              <Route path='token' element={<InnerTokenPage />} />
              <Route
                path='*'
                element={
                  <main style={{ padding: '1rem' }}>
                    <p>Wrong URL path! There's nothing here.</p>
                  </main>
                }
              />
            </Routes>
          </Container>
        </Router>
      </BlockchainProvider>
    </div>
  )
}

export default App;
