const Marketplace = artifacts.require('./Marketplace.sol');

contract('Marketplace', function (accounts) {
	let instance; 
	
	const _owner = accounts[0];
	const _account1 = accounts[1]; 
	const _account2 = accounts[2]; 
	const _account3 = accounts[3]; 
	
	const oneFinney = 10 ** 15;
	const oneEther = 10 ** 18;
	
	let products = [{name:'Product1', price: oneEther,quantity: 2},
	{name:'Product2', price: oneEther,quantity: 10},
	{name:'Product3', price: oneEther,quantity: 10}];
	
	async function assertThrowsAsync(fn) {
	  let f = () => {};
	  try {
		await fn();
	  } catch(e) {
		f = () => {throw e};
	  } finally {
		assert.throws(f);
	  }
	}
	
	console.log(_owner);
	
	 beforeEach(async function (){
	  instance = await Marketplace.new({ from: _owner});
	  for(var i = 0; i<products.length; i++){
		  await instance.newProduct(products[0].name,products[0].price,products[0].quantity,{from: _owner});
		  products[0].id = await instance.getProductID(products[0].name);
	  }
	 });
		  
	 
	 
	 it("only owner should be able add a product", async function(){
	  let productID = await instance.getProductID('Product1');
	  await instance.newProduct('Product10',oneEther,2,{from: _owner});
	  
	  console.log(productID);
	  
	  //assert.strictEqual(productID, 0x9986eea2299be250342f65eb0548a2469ee5526417ffb2fc3820ee1000c7ae25, "gamesCount should be 0");  
	  
	  await assertThrowsAsync(async () => await instance.newProduct('Product2',oneEther,2,{from: _account1}));
	 });
	 
	 it("only owner should be able to update a product", async function(){
	  let productID = await instance.getProductID('Product1');
	  await instance.newProduct('Product1',oneEther,2,{from: _owner});
	  
	  console.log(productID);
	  
	  //assert.strictEqual(productID, 0x9986eea2299be250342f65eb0548a2469ee5526417ffb2fc3820ee1000c7ae25, "gamesCount should be 0");  
	  
	  await assertThrowsAsync(async () => await instance.newProduct('Product2',oneEther,2,{from: _account1}));
	 });
}); 