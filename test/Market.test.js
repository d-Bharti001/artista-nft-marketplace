const NFT = artifacts.require("NFT");
const Market = artifacts.require("Market");

const { expect } = require("chai");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const BN = web3.utils.BN;
const chaiBN = require("chai-bn")(BN);
chai.use(chaiAsPromised);
chai.use(chaiBN);

contract("NFT contract test", () => {
  it("Should be able to mint new NFTs", async () => {
    let nft = await NFT.deployed();
    let id = 1;
    await expect(nft.mint(id, id)).to.eventually.be.fulfilled;
  });
  it("Should reject nft creations with previous id", async() => {
    let nft = await NFT.deployed();
    let id = 1;
    await expect(nft.mint(id, id)).to.eventually.be.rejectedWith("token already minted");
  });
});

contract("Market contract test", (accounts) => {

    before(async () => {
      this.nft = await NFT.deployed();
      await this.nft.mint(1, "1");
    });

    it("Should not be able to create item if not approved", async () => {
      let instance = await Market.deployed();
      let listingPrice = await instance.listingPrice();
      await expect(instance.createMarketItem(1, web3.utils.toWei("0.9"), { value: listingPrice }))
        .to.eventually.be.rejectedWith("Approve the NFT to the market contract");
    });

    it("Should be able to create market item", async () => {
      let instance = await Market.deployed();
      let listingPrice = await instance.listingPrice();
      await expect(this.nft.approve(instance.address, 1)).to.eventually.be.fulfilled;
      await expect(instance.createMarketItem(1, web3.utils.toWei("0.9"), { value: listingPrice }))
        .to.eventually.be.fulfilled;
    });

    it("Seller can't buy their item on sale", async () => {
      let instance = await Market.deployed();
      let res = await instance.marketItem(1);
      await expect(instance.buyMarketItem(1, { value: res.price, from: accounts[0] }))
        .to.eventually.be.rejectedWith("Seller can't buy");
    });

    it("Anyone can buy an item on sale", async () => {
      let instance = await Market.deployed();
      let res = await instance.marketItem(1);
      await expect(instance.buyMarketItem(1, { value: res.price, from: accounts[1] }))
        .to.eventually.be.fulfilled;
      expect(await this.nft.ownerOf(1)).to.be.equal(accounts[1]);
    });

    it("Item can't be de-listed once bought", async () => {
      let instance = await Market.deployed();
      await expect(instance.delistMarketItem(1)).to.eventually.be.rejectedWith("Market item has been sold");
    });

    it("New owner should be able to sell the item", async () => {
      let instance = await Market.deployed();
      let listingPrice = await instance.listingPrice();
      await expect(this.nft.approve(instance.address, 1, { from: accounts[1] })).to.eventually.be.fulfilled;
      await expect(instance.createMarketItem(1, web3.utils.toWei("1"), { value: listingPrice, from: accounts[1] }))
        .to.eventually.be.fulfilled;
    });

    it("Should not allow to start new sale if item is listed and not bought", async () => {
      let instance = await Market.deployed();
      let listingPrice = await instance.listingPrice();
      expect(await this.nft.getApproved(1)).to.be.equal(instance.address);
      await expect(instance.createMarketItem(1, web3.utils.toWei("1"), { value: listingPrice, from: accounts[1] }))
        .to.eventually.be.rejectedWith("Market item is listed and not bought yet");
    })

    it("Item can be de-listed when not bought", async () => {
      let instance = await Market.deployed();
      await expect(instance.delistMarketItem(1, { from: accounts[1] })).to.eventually.be.fulfilled;
    });

    it("Should not allow anyone except the owner of a token to start the sale", async () => {
      let instance = await Market.deployed();
      let listingPrice = await instance.listingPrice();
      expect(await this.nft.ownerOf(1)).to.be.equal(accounts[1]);
      expect(await this.nft.getApproved(1)).to.be.equal(instance.address);
      await expect(instance.createMarketItem(1, "1000", { value: listingPrice, from: accounts[0] }))
        .to.eventually.be.rejectedWith("Only the owner of the NFT can start the sale");
    });
  }
);