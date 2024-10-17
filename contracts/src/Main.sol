// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "./Collection.sol";

contract Main is Ownable {
  uint256 private count;
  mapping(uint256 => Collection) private collections;

  //on set events ici pour communiquer avec le front end
  event CollectionCreated(uint256 count, string name, uint256 cardCount);
  event CardMinted(uint256 collectionID, uint256 unique_id, address recipient, uint256 cardNumber, string ImgField);

// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    constructor() Ownable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) {
        count = 0;
    }

  function createCollection(string calldata name, uint256 cardCount) external onlyOwner{
    address user =  address (this);
    Collection newCollection = new Collection(user,name, cardCount);
    collections[count++] = newCollection;

    //emit un event? a voir
    emit CollectionCreated(count, name, cardCount);
  }

  function mintCard(uint256 collectionID, address recipient, uint256 cardNumber, string calldata ImgField) external onlyOwner {
    require(collectionID <= count, "ERROR: Collection does not exist");
    uint256 unique_id = collections[collectionID].mintCard(recipient, collectionID,cardNumber, ImgField);
    //pour tracker les cards minted
    emit CardMinted(collectionID, unique_id,recipient, cardNumber, ImgField);
  }

  function getCollection(uint256 collectionID) public returns (Collection) {
    return collections[collectionID];
  }

  function getCollectionCount() public view returns (uint256) {
    return count;
  }

}
