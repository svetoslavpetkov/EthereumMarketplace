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
		  await instance.newProduct(products[i].name,products[i].price,products[i].quantity,{from: _owner});
		  products[0].id = await instance.getProductID(products[0].name);
	  }
	 });
		  
	 
	 //
	 // Add new product
	 //
	 it("only owner should add a product", async function(){
	  let productID = await instance.getProductID('Product1');
	  await instance.newProduct('Product10',oneEther,2,{from: _owner});
	  
	  //assert that only owner can create new product
	  await assertThrowsAsync(async () => await instance.newProduct('Product2',oneEther,2,{from: _account1}));
	 });
	 
	 it("add a product and reading back the data", async function(){
		let productID = await instance.getProductID('Product10');
		await instance.newProduct('Product10',oneEther,2,{from: _owner});	  
		//get the product
		[name, price, quantity] = await instance.getProduct(productID);
	  
		assert.strictEqual(name, 'Product10', "name should be correct");
		assert.strictEqual(price.toNumber(), oneEther, "price should be correct");
		assert.strictEqual(quantity.toNumber(), 2, "quantity should be correct");	  
	 });
	 
	it("add product validation should work", async function(){	  	 
	  //price 0 is not allowed
	  await assertThrowsAsync(async () => await instance.newProduct('Product10',0,2,{from: _owner}));
	  
	  //product already added
	  await assertThrowsAsync(async () => await instance.newProduct(products[1].name,oneEther,0,{from: _owner}));
	 });
	 
	 //
	 //Update product
	 //	 
	 it("only owner should be able to update a product", async function(){	  
	  await instance.update(products[0].id,50,{from: _owner});	  	  	 
	  
	  await assertThrowsAsync(async () => await instance.update(products[1].id,20,{from: _account1}));
	 });
	 
	it("update product and reading back the data", async function(){
		await instance.update(products[0].id,50,{from: _owner});	  
		[name, price, quantity] = await instance.getProduct(products[0].id);	 
		assert.strictEqual(quantity.toNumber(), 50, "quantity should be correct");	  
	 });
	 
	it("update product with quantity 0 is acceptable", async function(){
		await instance.update(products[0].id,0,{from: _owner});	  
		[name, price, quantity] = await instance.getProduct(products[0].id);	 
		assert.strictEqual(quantity.toNumber(), 0, "quantity should be correct");	  
	 });
	 
	 //
	 // getPRice calculation
	 //	 
	it("get price should return correct data", async function(){
		let singleItemPrice = 5 * oneEther;
		let productID = await instance.getProductID('Product100');
		await instance.newProduct('Product100',singleItemPrice,20,{from: _owner});		
		  
		let totalPrice = await instance.getPrice(productID, 1);	 
		assert.strictEqual(totalPrice.toNumber(), singleItemPrice, "quantity should be correct");	

		totalPrice = await instance.getPrice(productID, 5);	 
		assert.strictEqual(totalPrice.toNumber(), 5 * singleItemPrice, "quantity should be correct");			
	 });
	 
	it("get price should throw error on overflow", async function(){
		let singleItemPrice = 10 ** 77;
		let quantity = 10 ** 20;
		let productID = await instance.getProductID('Product100');
		await instance.newProduct('Product100',singleItemPrice,20,{from: _owner});		
		
		await assertThrowsAsync(async () => await instance.getPrice(productID, quantity));
	 });
	 
	 //
	 // buy products
	 //
	 it("buy products should work :)", async function(){
		let singleItemPrice = oneEther;
		let productID = await instance.getProductID('Product100');
		await instance.newProduct('Product100',singleItemPrice,10,{from: _owner});		
		
		console.log('product inserted');
		
		//buy 5 of the items with exact money
		let totalPrice = singleItemPrice * 5;
		await instance.buy(productID,5,{from: _account1, value: totalPrice});
		
		//trying to buy more than available
		totalPrice = singleItemPrice * 10;
		await assertThrowsAsync(async () => await instance.buy(productID,10,{from: _account1, value: totalPrice}));
		
		// buy last 5 sending more money
		totalPrice = (singleItemPrice * 5 ) + oneEther;
		await instance.buy(productID,5,{from: _account2, value: totalPrice});	
		
		[name, price, quantity] = await instance.getProduct(productID);	 
		assert.strictEqual(quantity.toNumber(), 0, "quantity should be 0");			
	 });
	 
	it("buy products should have working validation", async function(){
		let singleItemPrice = oneEther;
		let productID = await instance.getProductID('Product100');
		await instance.newProduct('Product100',singleItemPrice,10,{from: _owner});		
		
		//trying to buy with less money
		let totalPrice = (singleItemPrice * 5) - 1;
		await assertThrowsAsync(async () => await instance.buy(productID,10,{from: _account1, value: totalPrice}));
		
		//trying to buy 0 quantity			
		totalPrice = singleItemPrice ;
		await assertThrowsAsync(async () => await instance.buy(productID,0,{from: _account1, value: totalPrice}));
	 });
	 
	it("get all productIDs should work", async function(){
		let allProducts = await instance.getProducts();		
		assert.strictEqual(allProducts.length, 3, "there should be 3 products");	
		
		await instance.newProduct('Product100',oneEther,10,{from: _owner});
		
		allProducts = await instance.getProducts();		
		assert.strictEqual(allProducts.length, 4, "there should be 4 products");
	 });
	 
}); 