var NFTContract = artifacts.require("NFT");
var MarketContract = artifacts.require("Market");

module.exports = async function(deployer) {
  // Deploy the NFT contract
  await deployer.deploy(NFTContract, "Artista", "ART");
  // Deploy the Market contract with NFT contract address as parameter
  let NFT = await NFTContract.deployed();
  await deployer.deploy(MarketContract, NFT.address);
  // Set listing price
  let market = await MarketContract.deployed();
  let listingPrice = web3.utils.toWei("0.025", "ether");
  await market.setListingPrice(listingPrice);
};