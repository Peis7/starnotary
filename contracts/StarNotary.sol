// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721('Ad Astra','AST') {

    // Star data
    struct Star {
        string name;
        string symbol;
    }

    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, string memory _symbol, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name, _symbol); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return payable(x);
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(ownerAddress != _msgSender(), "You can not buy your own star");
        require(msg.value > starCost, "You need to have enough Ether");
        transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            _make_payable(msg.sender).transfer(msg.value - starCost);
        }
    }

    function approveStar(address to, uint256 tokenId) public  payable {
        approve(to, tokenId);
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint256 _tokenId) public view returns (Star memory) {
        //1. You should return the Star saved in tokenIdToStarInfo mapping
        require(_exists(_tokenId), "ERC721: invalid token ID");
        return tokenIdToStarInfo[_tokenId];
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. Passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. You don't have to check for the price of the token (star)
        //3. Get the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)
        //4. Use _transferFrom function to exchange the tokens.
        require(_exists(_tokenId1) && _exists(_tokenId2), "ERC721: invalid token ID"); //both tokens must exist
        address ownerToken1 = ownerOf(_tokenId1);//we get the owner of the _tokenId1
        address ownerToken2 = ownerOf(_tokenId2);//we get the owner of the _tokenId2
        require(ownerToken1 != ownerToken2, "ERC721: Token owners must be diferent");//token owners must be diferent
        require(ownerToken1 == _msgSender() || ownerToken1 == _msgSender(), "ERC721: Owner of token1 or token2 must be the sender");//token owners must be diferent
        require(_isApprovedOrOwner(ownerToken1, _tokenId2), "ERC721: token2 is not token owner or approved");
        require(_isApprovedOrOwner(ownerToken2, _tokenId1), "ERC721: caller is not token owner or approved");
        _transfer(ownerToken1, ownerToken2, _tokenId1);
        _transfer(ownerToken2, ownerToken1, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public payable{
        //1. Check if the sender is the ownerOf(_tokenId)
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        transferFrom(msg.sender, _to1, _tokenId); //this function checks if the sender is the ownerOf the token or appoved
    }

}
