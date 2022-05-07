import React, { useEffect, useRef, useState } from 'react'
import * as nsfwjs from 'nsfwjs'
import { create as createIpfsClient } from 'ipfs-http-client'
import { Button, Card, Container, Form } from 'react-bootstrap'
import { useBlockchain } from '../contexts/BlockchainContext'
import WalletConnect from './WalletConnect'
import { createRandomId } from '../utils'

const ipfsClient = createIpfsClient('https://ipfs.infura.io:5001/api/v0')

function CreateTokenPage() {

  const [loading, setLoading] = useState(false)
  const [uploadedToIpfs, setUploadedToIpfs] = useState(false)
  const [txSuccess, setTxSuccess] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [imageError, setImageError] = useState(false)
  const [mintedTokenId, setMintedTokenId] = useState()
  const nsfwjsModel = useRef()
  const tokenName = useRef()
  const tokenDesc = useRef()
  const imageFile = useRef()
  const imageUploadUrl = useRef('')
  const metadataUploadUrl = useRef('')

  const { account, NFTContract } = useBlockchain()

  useEffect(() => {
    const loadNsfwjs = async () => {
      try {
        let model = await nsfwjs.load()
        nsfwjsModel.current = model
      } catch (err) {
        console.error(err.message)
        setMsg({ text: 'Some error occurred. Check console for details.', type: 'danger' })
      }
    }
    loadNsfwjs()
  }, [])

  const handleFileChange = () => {
    const validFileTypes = ['image/jpeg', 'image/jpg', 'image/png']
    let file = imageFile.current.files[0]
    imageUploadUrl.current = ''
    setImageError(false)
    setMsg({ text: '', type: '' })
    if (!validFileTypes.includes(file.type)) {
      setImageError(true)
      setMsg({ text: 'Please upload a JPEG or PNG file', type: 'danger' })
      return
    }
    if (file.size > 13 * 1024 * 1024) {
      setImageError(true)
      setMsg({ text: 'Image size shouldn\'t be more than 13 MB.', type: 'danger' })
      return
    }
    setLoading(true)
    setMsg({ text: 'Analyzing image. Please wait...', type: 'secondary' })
    let image = new Image(400, 400)
    let url = URL.createObjectURL(file)
    image.src = url
    nsfwjsModel.current.classify(image)
      .then(pred => {
        console.log("Predictions:", pred)
        let probHentai = pred.find(c => c.className === 'Hentai').probability
        let probPorn = pred.find(c => c.className === 'Porn').probability
        let probSexy = pred.find(c => c.className === 'Sexy').probability
        if (probHentai > 0.5 || probPorn > 0.5 || probSexy > 0.6) {
          setImageError(true)
          setMsg({ text: 'The image seems to contain explicit content. It can\'t be accepted.', type: 'danger' })
        } else {
          setMsg({ text: 'Image is okay. Proceed to upload the file to IPFS.', type: 'success' })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err.message)
        setMsg({ text: 'Some error occurred. Please check console for details.', type: 'danger' })
        setImageError(true)
        setLoading(false)
      })
  }

  const handleUploadToIpfs = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: 'Please wait while the file is being uploaded to IPFS...', type: 'secondary' })
    if (!imageUploadUrl.current) {
      try {
        let imageUploaded = await ipfsClient.add(imageFile.current.files[0])
        imageUploadUrl.current = `https://ipfs.infura.io/ipfs/${imageUploaded.path}`
        console.log('Image uploaded:', imageUploadUrl.current)
      } catch (err) {
        console.error(err.message)
        setMsg({ text: 'Some error occurred while uploading image. Try again.', type: 'danger' })
        setLoading(false)
        return
      }
    }
    let metadata = JSON.stringify({
      name: tokenName.current.value,
      description: tokenDesc.current.value,
      image: imageUploadUrl.current,
    })
    try {
      let metadataUploaded = await ipfsClient.add(metadata)
      metadataUploadUrl.current = `https://ipfs.infura.io/ipfs/${metadataUploaded.path}`
      console.log('Metadata uploaded:', metadataUploadUrl.current)
    } catch (err) {
      console.error(err.message)
      setMsg({ text: 'Some error occurred while uploading the image metadata. Try again.', type: 'danger' })
      setLoading(false)
      return
    }
    setMsg({
      text: 'File uploaded to IPFS successfully. Now proceed to mint a new token in the smart contract.',
      type: 'success'
    })
    setUploadedToIpfs(true)
    setLoading(false)
  }

  const handleMintToken = () => {
    if (!metadataUploadUrl.current) {
      setMsg({ text: 'Please upload the file to IPFS first before minting the token.', type: 'danger' })
      return
    }
    setLoading(true)
    setMsg({ text: 'Please confirm the transaction on your wallet, and wait for it to complete...', type: 'secondary' })
    let tokenId = Number.parseInt(createRandomId())
    NFTContract.methods.mint(tokenId, metadataUploadUrl.current).send({ from: account })
      .then(tx => {
        console.log(tx)
        setMsg({ text: `Token #${tokenId} created successfully.`, type: 'success' })
        setMintedTokenId(tokenId.toString())
        setTxSuccess(true)
        setLoading(false)
      })
      .catch(err => {
        console.error(err.message)
        setMsg({ text: 'Some error occurred. Please try again. Check console for details.', type: 'danger' })
        setLoading(false)
      })
  }

  return (
    <div>
      <h2>Create new token</h2>
      <Form id='details-form' onSubmit={handleUploadToIpfs}>
        <Form.Group className='mt-4 mb-2' controlId='tokenName'>
          <Form.Label>Token name</Form.Label>
          <Form.Control
            required
            type='text'
            ref={tokenName}
            disabled={loading || uploadedToIpfs}
          />
        </Form.Group>
        <Form.Group className='mb-2' controlId='tokenDesc'>
          <Form.Label>Description</Form.Label>
          <Form.Control
            required
            as='textarea'
            rows={3}
            ref={tokenDesc}
            disabled={loading || uploadedToIpfs}
          />
        </Form.Group>
        <Form.Group className='mb-4' controlId='tokenImage'>
          <Form.Label>Token image</Form.Label>
          <Form.Control
            required
            type='file'
            accept='.jpeg, .jpg, .png'
            ref={imageFile}
            onChange={handleFileChange}
            disabled={loading || uploadedToIpfs}
          />
        </Form.Group>
      </Form>
      {msg.text &&
        <Card border={msg.type} className='mt-4 mb-4'>
          <Card.Body className='text-center'>
            <Card.Text>{msg.text}</Card.Text>
          </Card.Body>
        </Card>
      }
      {mintedTokenId &&
        <Container className='text-center mx-auto mt-4 mb-4'>
          <Button variant='outline-primary'
            as='a'
            href={`/token?tokenId=${mintedTokenId}`}
            target='_blank'
          >
            View your token:<i className='bi bi-box-arrow-up-right ms-2'></i>
          </Button>
        </Container>
      }
      {account ?
        <div>
          <div className='mt-4 mb-4'>
            <p>Step 1: Upload to IPFS</p>
            <Button
              type='submit'
              form='details-form'
              variant={uploadedToIpfs ? 'success' : 'primary'}
              disabled={loading || uploadedToIpfs || imageError}
            >
              {uploadedToIpfs ? 'Uploaded' : loading ? 'Please wait' : 'Upload your file'}
            </Button>

          </div>
          <div className='mt-2 mb-5'>
            <p>Step 2: Mint token in the smart contract</p>
            <Button
              type='button'
              variant={txSuccess ? 'success' : 'primary'}
              onClick={handleMintToken}
              disabled={!uploadedToIpfs || loading || txSuccess || imageError}
            >
              {txSuccess ? 'Minted' : loading ? 'Please wait' : 'Mint token'}
            </Button>
          </div>
        </div> :
        <WalletConnect />
      }
    </div>
  )
}

export default CreateTokenPage
