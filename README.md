# Artista - NFT Marketplace
A platform for selling & buying 2D artworks

- Sell your creative works as NFTs (based on ERC721 standard) and get paid in Ethers
- Token name: Artista
- Token symbol: ART
- Token contract address on Goerli testnet: 0x4003B57BB631A56f830AF3321D46f6374d8f9Ee9
- Market contract address on Goerli testnet: 0xF40b1949CCA80B7BFeaED7F22afAF133422A8bB1

## Interacting with the web app
Metamask extension is required for on-chain activities.

### Homepage
View all the tokens on sale, and also those which are sold out.

### Your items
View all the tokens you created, and also the tokens you've bought.

### Creating a new token
- Provide a name and a description of the token, and select an image from your local storage.
- Upload the data to IPFS.
- Mint new token. Token ID is generated randomly.
- You can view your token on 'Your Items' page.

### Listing a token on the marketplace
- Set a price in Ethers.
- Approve the NFT to the Market contract.
- Start the sale by providing listing fee.
  - Listing fee is required for the benefit of the platform.
  - The fee is locked in the Market contract until someone buys your token. Once bought, that fee is transferred to the owner of the contract.
  - You can de-list your item from sale and get your invested fee back.

### Buying a token
- Simply click on the Buy button on a token's page to pay the specified price to the seller, and get the token.
- The ownership of the token is transferred to you.
- The listing fee supplied by the seller is transferred to the platform owner.
- You can re-sell the token on other platforms like [testnets.opensea.io](https://testnets.opensea.io/).
- Currently the frontend doesn't support re-sale of tokens.
