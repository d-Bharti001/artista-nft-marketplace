// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFT Contract
 *
 * @dev Based on ERC721
 * Stores the token IDs and URIs for those tokens
 */
contract NFT is ERC721URIStorage, Ownable {
  /**
   * @dev Base URI for the NFTs
   */
  string public baseUri;

  /**
   * @dev Initialize the contract with token name and symbol
   *
   * @param _nftName Name of the token
   * @param _nftSymbol Token symbol
   */
  constructor(
    string memory _nftName,
    string memory _nftSymbol
  ) ERC721(_nftName, _nftSymbol) {

  }

  /**
   * @dev Mint a new token
   *
   * @param _tokenId ID of the new token to be minted
   * @param _tokenUri URI of the token
   */
  function mint(uint _tokenId, string memory _tokenUri) public {
    require(_tokenId > 0, "Token id should be greater than zero");
    _mint(msg.sender, _tokenId);
    _setTokenURI(_tokenId, _tokenUri);
  }

  /**
   * @dev Allows the contract owner to set base URI for the token
   *
   * @param _uri the new URI to be set
   */
  function setBaseURI(string memory _uri) external onlyOwner {
    baseUri = _uri;
  }

  /**
   * @dev Returns the base URI
   *
   * @return string the base URI
   */
  function _baseURI() internal view override returns(string memory) {
    return baseUri;
  }

  /**
   * @dev Restricts the owner from setting the ownership to null address
   */
  function renounceOwnership() public view override onlyOwner {
    revert("Ownership can't be renounced for this contract");
  }
}
