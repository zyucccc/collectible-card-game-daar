// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract Collection is ERC721,Ownable{

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
  function mintCard(address recipient,uint256 collection_id,uint256 cardNumber,string memory ImgField) public onlyOwner returns (uint256){
    uint256 token_ids = counter_token_ids++;
    CollectionCards[token_ids] = CardMetaData(cardNumber,ImgField);
    //d'abord on met tous les collections le meme adresse que le Main contract
    //alors pour eviter les conflits de token_id on fait une formule avec le facteur collection_id pour generer un unique_id
    uint256 unique_id = collection_id * 1e6 + token_ids;
    _mint(recipient, token_ids);
    return unique_id;
  }

  function getCollectionCards(uint256 token_id) public view returns (CardMetaData memory){
    //check if the token_id exists dans la CollectionCards
    require(token_id <= counter_token_ids, "ERROR: Le token_id n'existe pas dans la CollectionCards");
    return CollectionCards[token_id];
  }


}
