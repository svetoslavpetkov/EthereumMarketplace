pragma solidity 0.4.19;
/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, throws on overflow.
  */
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  /**
  * @dev Integer division of two numbers, truncating the quotient.
  */
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  /**
  * @dev Subtracts two numbers, throws on overflow (i.e. if subtrahend is greater than minuend).
  */
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  /**
  * @dev Adds two numbers, throws on overflow.
  */
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Marketplace {
  
    struct ProductData{
        string name;
        uint256 price;
        uint256 quantity;
    }
        
    address private owner;
    mapping(bytes32 => ProductData) private products ;
    bytes32[] private allProductsIds;
    
    event BuyLog(bytes32 indexed productId,address indexed buyer, uint256 quantity, uint256 price);
    event ProductAdded(bytes32 productId,string name, uint256 quantity, uint256 price);
    event ProductUpdated(bytes32 indexed productId,uint256 newQuantity);
    
    function Marketplace() public{
        owner = msg.sender;
    }
    
    modifier onlyOwner(){
        require(msg.sender == owner);
        _;
    }

    
    function buy(bytes32 ID, uint quantity) public payable {
        require(quantity > 0);
        require(products[ID].quantity >= quantity);
        require(msg.value >= SafeMath.mul( quantity, products[ID].price));
        
        products[ID].quantity = SafeMath.sub(products[ID].quantity ,quantity);
        
        BuyLog(ID, msg.sender, quantity, products[ID].price);
    }
    
    function update(bytes32 ID, uint newQuantity) public onlyOwner {
        //ensure the product exists
        require(products[ID].price > 0);
        
        products[ID].quantity = newQuantity;
        
        ProductUpdated(ID, newQuantity);
    }
	
	function getProductID(string name) pure public returns(bytes32){
		return sha256(name);
	}
    
    //creates a new product and returns its ID
    function newProduct(string name, uint price, uint quantity) public onlyOwner returns(bytes32) {
        require(price > 0);
        bytes32 _id = sha256(name);
        assert(products[_id].price == 0);
        
        ProductData memory data;
        data.name = name;
        data.price = price;
        data.quantity = quantity;
        
        products[_id] = data;
        allProductsIds.push(_id);
        
        ProductAdded(_id, name,quantity, price);
    }
    
    function getProduct(bytes32 ID) public view returns(string name, uint price, uint quantity) {
        require(products[ID].price > 0);        
        return(name = products[ID].name, price = products[ID].price, quantity = products[ID].quantity);
    }
    
    function getProducts() public view returns(bytes32[]) {
        return allProductsIds;
    }
    
    function getPrice(bytes32 ID, uint quantity) public view returns (uint) {
        require(products[ID].price > 0);       
        return SafeMath.mul(products[ID].price , quantity);
    }
}