// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Marketplace contract
 *
 * @dev There are three main functions:
 *      createMarketItem - to create a market item and start a sale
 *      buyMarketItem - to buy an item on sale
 *      delistMarketItem - to remove an item from sale
 *
 * After minting a token, the owner of the token can start its sale using createMarketItem.
 * They should supply a listing price, which is locked in this contract, and is transferred
 * to the contract owner when someone buys the item. Prior to creating the market item, they must approve
 * their NFT to this contract.
 *
 * When someone buys an item, they have to supply an amount equal to the price set by the seller.
 * That amount is transferred to the seller, the locked listing price is transferred to the contract owner,
 * and the NFT is transferred from the seller to the buyer.
 *
 * If the item is not bought, the seller can de-list the item from the marketplace and get
 * the invested listing fee back to their account.
 */
contract Market is Ownable, ReentrancyGuard {
  /**
   * @dev NFT contract address
   */
  address NFTAddress;

  /**
   * @dev Listing price for market items
   * When creating an item, the creator has to send this amount, which is locked in the contract.
   * When the item is sold, this amount is sent to the owner of the contract.
   */
  uint public listingPrice;

  struct MarketItem {
    uint tokenId;
    address seller;
    address buyer;
    uint price;
    uint listingPrice;
  }

  /**
   * @dev Mapping from token IDs to Market items
   */
  mapping(uint => MarketItem) public marketItem;

  event MarketItemCreated(
    uint indexed tokenId,
    address indexed seller,
    uint price,
    uint listingPrice,
    uint timestamp
  );

  event MarketItemBought(
    uint indexed tokenId,
    address indexed seller,
    address indexed buyer,
    uint price,
    uint listingPrice,
    uint timestamp
  );

  event MarketItemDelisted(
    uint indexed tokenId,
    address indexed seller,
    uint price,
    uint listingPrice,
    uint timestamp
  );

  event ListingPriceChanged(
    uint indexed oldPrice,
    uint indexed newPrice,
    uint timestamp
  );

  /**
   * @dev Set the NFT contract address while deploying
   *
   * @param _nft address of the nft contract
   */
  constructor(address _nft) {
    require(_nft != address(0), "Invalid nft contract address");
    NFTAddress = _nft;
  }

  /**
   * @dev Create a new market item to be listed on the marketplace.
   * Can only be called if it isn't already created OR, if created then has been bought.
   * Before calling this function, the owner of the nft has to approve the nft to this contract.
   * The owner has to send an amount equal to the listing price, which would be transferred to the
   * contract owner when someone buys the nft.
   * 
   * @param _tokenId the id of the nft
   * @param _price selling price for the nft
   */
  function createMarketItem(uint _tokenId, uint _price) public payable nonReentrant {
    MarketItem storage item = marketItem[_tokenId];
    require(item.seller == address(0) || item.buyer != address(0), "Market item is listed and not bought yet");

    require(_price > 0, "Price should be greater than zero");
    require(msg.value == listingPrice, "Send an amount equal to the listing price");
    require(IERC721(NFTAddress).ownerOf(_tokenId) == msg.sender, "Only the owner of the NFT can start the sale");
    require(IERC721(NFTAddress).getApproved(_tokenId) == address(this), "Approve the NFT to the market contract");

    item.tokenId = _tokenId;
    item.seller = msg.sender;
    item.buyer = address(0);
    item.price = _price;
    item.listingPrice = msg.value;

    emit MarketItemCreated(item.tokenId, item.seller, item.price, item.listingPrice, block.timestamp);
  }

  /**
   * @dev Buy a market item
   * The buyer has to send an amount equal to the price of the nft, which is transferred to the seller.
   * The listing price (which was locked in the contract since the time when the item was created) is
   * transferred to the contract owner.
   *
   * @param _tokenId the id of the nft to buy
   */
  function buyMarketItem(uint _tokenId) public payable nonReentrant {
    MarketItem storage item = marketItem[_tokenId];
    require(item.buyer == address(0), "Market item has been sold");

    require(msg.value == item.price, "Send an amount equal to the price of the item");
    require(msg.sender != item.seller, "Seller can't buy");
    item.buyer = msg.sender;
    payable(item.seller).transfer(item.price);
    payable(owner()).transfer(item.listingPrice);
    IERC721(NFTAddress).transferFrom(item.seller, item.buyer, item.tokenId);

    emit MarketItemBought(item.tokenId, item.seller, item.buyer, item.price, item.listingPrice, block.timestamp);
  }

  /**
   * @dev Remove a market item
   * If the item is not bought, the seller can remove the created market item.
   * They also get back the listing price they had invested while creating the item.
   *
   * @param _tokenId the id of the nft
   */
  function delistMarketItem(uint _tokenId) public {
    MarketItem storage item = marketItem[_tokenId];
    require(item.buyer == address(0), "Market item has been sold");
    require(msg.sender == item.seller, "Only the seller can de-list their item");

    payable(item.seller).transfer(item.listingPrice);

    emit MarketItemDelisted(item.tokenId, item.seller, item.price, item.listingPrice, block.timestamp);

    delete marketItem[_tokenId];
  }

  /**
   * @dev Allows the owner to set the listing price.
   *
   * @param _price the new listing price
   */
  function setListingPrice(uint _price) public onlyOwner {
    emit ListingPriceChanged(listingPrice, _price, block.timestamp);
    listingPrice = _price;
  }

  /**
   * @dev Restricts the owner from setting the ownership to null address
   */
  function renounceOwnership() public view override onlyOwner {
    revert("Ownership can't be renounced for this contract");
  }
}
