const Marketplace = artifacts.require('./Marketplace.sol');

contract('Marketplace', function (accounts) {
	let instance; 
	
	const _owner = accounts[0];
	const _campaignAcc = accounts[1]; 
	const _player1 = accounts[2]; 
	const _player2 = accounts[3]; 
	
	const oneFinney = 10 ** 15;
	const oneEther = 10 ** 18;
	
	console.log(_owner);
	
	 beforeEach(async function (){
	  instance = await Marketplace.new({ from: _owner});
	 });
		  
	 
	 
	 it("only owner should be able add a product", async function(){
	  let productID = await instance.newProduct('Product1',oneEther,2,{from: _owner});
	  console.log(productID);
	  assert.strictEqual(productID, 0x627306090abab3a6e1400e9345bc60c78a8bef57, "gamesCount should be 0");  
	 });
}); 