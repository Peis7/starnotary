const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let starId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', 'AWS', starId, {from: accounts[0]})
    const result = await instance.lookUptokenIdToStarInfo( starId, {from: accounts[0]});
    assert.equal(result.name, 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.approveStar(user2, starId, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);

    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.approveStar(user2, starId, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[4];
    let user2 = accounts[5];
    let starId = 55;
    let starPrice = web3.utils.toWei("1", "ether");
    let balance = web3.utils.toWei("5", "ether");
    await instance.createStar('awesome star', 'AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.approveStar(user2, starId, {from: user1});
    const balanceOfUser2BeforeTransaction = web3.utils.toBN(await web3.eth.getBalance(user2));
    const gasPrice = web3.utils.toWei("20", 'gwei')
    const transaction = await instance.buyStar(starId, {from: user2, value: balance, gasPrice});
    const balanceAfterUser2BuysStar = web3.utils.toBN(await web3.eth.getBalance(user2));
    const gasUsed = web3.utils.toBN(transaction.receipt.gasUsed);
    const transactionCost = gasUsed.mul(web3.utils.toBN(gasPrice));
    let value = balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar).sub(transactionCost);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    const starNotaryInstance = await StarNotary.new();
    const name = await starNotaryInstance.name();
    const symbol = await starNotaryInstance.symbol();
    const tokenId = 111;
    await starNotaryInstance.createStar('Sun', 'SUN', tokenId, {from: accounts[0]});
    const result = await starNotaryInstance.tokenIdToStarInfo.call(tokenId);
    assert.equal(result.name, 'Sun')
    assert.equal(result.symbol, 'SUN')
  });

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let star1Id = 100;
    let star2Id = 101;
    await instance.createStar('Proxima B', 'PXB', star1Id, {from: user1});
    await instance.createStar('Proxima C','PXC', star2Id, {from: user2});
    await instance.approveStar(user2, star1Id, {from: user1});
    await instance.approveStar(user1, star2Id, {from: user2});
    await instance.exchangeStars(star1Id, star2Id, {from: user1});
    assert.equal(await instance.ownerOf(star1Id),user2);
    assert.equal(await instance.ownerOf(star2Id),user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let instance = await StarNotary.deployed();
    let user1 = accounts[6];
    let user2 = accounts[7];
    let starId = 200;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei("5", "ether");
    await instance.createStar('Proxima C', 'PXC', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.transferStar(user2, starId, {from: user1, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let user = accounts[1];
    let starId = 300;
    const name = 'Proxima B';
    const symbol = 'PXB';
    await instance.createStar(name,symbol,  starId, {from: user});
    const result = await instance.lookUptokenIdToStarInfo( starId, {from: user});
    assert.equal(name,result.name);
    assert.equal(symbol,result.symbol);
});