// SPDX-License-Identifier: MIT
pragma solidity ^0.8;
//import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract Collection is ERC721,ERC721Enumerable,ERC721URIStorage,Ownable{

  string public collectionName;
  uint256 public cardCount;

//les tokens pour les cards de chaque collection doivent être uniques
  uint256 private counter_token_ids = 0;

  struct CardMetaData{
    uint256 cardNumber;
    string ImgField;
  }

  mapping(uint256 => CardMetaData) private CollectionCards;

  constructor(address user,string memory _name, uint256 _cardCount) Ownable(user) ERC721(_name, "Collection"){
    collectionName = _name;
    cardCount = _cardCount;
  }

  //generer un card
  function mintCard(address recipient,uint256 collection_id,uint256 cardNumber,string memory ImgField) public returns (uint256){
    require(counter_token_ids < cardCount, "Maximum number of cards reached");
    uint256 token_ids = counter_token_ids++;
    CollectionCards[token_ids] = CardMetaData(cardNumber,ImgField);
    //d'abord on met tous les collections le meme adresse que le Main contract
    //alors pour eviter les conflits de token_id on fait une formule avec le facteur collection_id pour generer un unique_id
    uint256 unique_id = collection_id * 1e6 + token_ids;
    _mint(recipient, unique_id);
//    console.log("Card minted with unique_id: %d", unique_id);
    return unique_id;
  }

  function getCollectionCards(uint256 token_id) public view returns (CardMetaData memory){
    //check if the token_id exists dans la CollectionCards
    require(token_id <= counter_token_ids, "ERROR: Le token_id n'existe pas dans la CollectionCards");
    return CollectionCards[token_id];
  }

  function getAllCollectionCards() public view returns (CardMetaData[] memory) {
    CardMetaData[] memory allCards = new CardMetaData[](counter_token_ids);
    for (uint256 i = 0; i < counter_token_ids; i++) {
        allCards[i] = CollectionCards[i];
    }
    return allCards;
  }

  function getCardsByOwner(address owner) public view returns (uint256[] memory) {
    uint256 balance = balanceOf(owner);
    uint256[] memory result = new uint256[](balance);
    for (uint256 i = 0; i < balance; i++) {
        result[i] = tokenOfOwnerByIndex(owner, i);
    }
    return result;
  }

//  override some functions
    //mise a jour le owner de card
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721, ERC721Enumerable) returns (address){
        return super._update(to, tokenId, auth);
    }

    //ajouter un balance
    function _increaseBalance(address account, uint128 amount) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    //check si contrat supporte l'interface
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool){
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}
