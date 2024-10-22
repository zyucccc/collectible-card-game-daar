// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
//import "hardhat/console.sol";
import "./Collection.sol";

contract Main is Ownable {
  uint256 private count;
  mapping(uint256 => Collection) private collections;
  mapping(address => uint256[]) private mapping_userCollections;

  //on set events ici pour communiquer avec le front end
  event CollectionCreated(address user,uint256 count, string name, uint256 cardCount);
  event CardMinted(uint256 collectionID, uint256 unique_id, address recipient, string cardNumber, string ImgField);

    struct CollectionInfo {
        uint256 id;
        string name;
        uint256 cardCount;
        Collection.CardMetaData[] cards;
    }
// Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
// Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

    constructor() Ownable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) {
        count = 0;
    }

  function createCollection(address user,string calldata name, uint256 cardCount) external onlyOwner{
//    address user =  address (this);
    Collection newCollection = new Collection(user,name, cardCount);
    collections[count] = newCollection;
    mapping_userCollections[user].push(count);

    //emit un event? a voir
    emit CollectionCreated(user,count, name, cardCount);
    count++;
  }

  function mintCard(uint256 collectionID, address recipient, string memory cardNumber, string calldata ImgField) external returns (uint256) {
    require(collectionID <= count, "ERROR: Collection does not exist");
    uint256 unique_id = collections[collectionID].mintCard(recipient, collectionID,cardNumber, ImgField);
    //pour tracker les cards minted
    emit CardMinted(collectionID, unique_id,recipient, cardNumber, ImgField);
    return unique_id;
  }

  function getCollection(uint256 collectionID) public view returns (Collection) {
    require(collectionID < count, "ERROR: Collection does not exist");
    return collections[collectionID];
  }

  function getCollectionsID(address user) public view returns (uint256[] memory) {
    return mapping_userCollections[user];
  }

  function getCollectionOwner(uint256 collectionID) public view returns (address) {
    require(collectionID < count, "ERROR: Collection does not exist");
    return collections[collectionID].owner();
  }

  function getCollectionCount() public view returns (uint256) {
    return count;
  }

  function getCollectionCards(uint256 collectionID, uint256 token_id) public view returns (Collection.CardMetaData memory) {
    require(collectionID < count, "ERROR: Collection does not exist");
    return collections[collectionID].getCollectionCards(token_id);
  }

  function getAllCollectionCards(uint256 collectionID) public view returns (Collection.CardMetaData[] memory) {
    require(collectionID < count, "ERROR: Collection does not exist");
    return collections[collectionID].getAllCollectionCards();
  }

  function getCollectionName(uint256 collectionID) public view returns (string memory) {
    require(collectionID < count, "ERROR: Collection does not exist");
    return collections[collectionID].collectionName();
  }

    function getUserCollection(address user) public view returns (CollectionInfo[] memory) {
        uint256[] memory userCollectionIds = mapping_userCollections[user];
//        console.log("Getting collections for user:", user);
//        console.log("test");
        CollectionInfo[] memory infos = new CollectionInfo[](userCollectionIds.length);
//        console.log("infos create");
        for (uint256 i = 0; i < userCollectionIds.length; i++) {
//            console.log("copying : ",i);
            uint256 collectionId = userCollectionIds[i];
            Collection collection = collections[collectionId];
            // Fill in CollectionInfo...
            infos[i] = CollectionInfo({
                id: collectionId,
                name: collection.collectionName(),
                cardCount: collection.cardCount(),
                cards: collection.getAllCollectionCards()
            });
//            console.log("copy terminate: ",i);
        }
//        console.log("Bien pass!");

        return infos;
    }

}
