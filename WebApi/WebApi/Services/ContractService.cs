using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using WebApi.Models.Config;
using WebApi.Models.Contract;
using WebApi.Models.Dto;

namespace WebApi.Services
{
    public class ContractService
    {
        public readonly HexBigInteger DefaultGas = new HexBigInteger(3000000);
        public readonly HexBigInteger Zero = new HexBigInteger(0);

        private static string contractAddress = "";

        private static Web3 _web3;
        private static Account _account;

        internal ContractMetadata GetMetadata()
        {
            return new ContractMetadata()
            {
                Abi = JsonConvert.SerializeObject(_contractInfo.Abi),
                Address = contractAddress
            };
        }

        private static ContractMetaInfo _contractInfo;

        public string ContractAddress { get; private set; }

        public ContractService(ContractConfig config)
        {
            Deploy(config.PrivateKey, config.NetworkUrl);
        }

        public void Deploy(string ownerPrivteKey, string nodeUrl)
        {
            _account = new Account(ownerPrivteKey);
            _web3 = new Web3(_account, nodeUrl);

            _contractInfo = GetContractInfo();

            if (contractAddress == string.Empty)
            {
                var senderAddress = _account.Address;
                var transactionHash = _web3.Eth.DeployContract.SendRequestAsync(_contractInfo.GetAbi(), _contractInfo.ByteCode, senderAddress, DefaultGas, new object[] { }).GetAwaiter().GetResult();

                var receipt = _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash).GetAwaiter().GetResult();
                while (receipt == null)
                {
                    Thread.Sleep(1000);
                    receipt = _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(transactionHash).GetAwaiter().GetResult();
                }

                contractAddress = receipt.ContractAddress;
                AddNewProduct("Cheese 1kg", 50, 100);
                AddNewProduct("iPhone XX", 1500, 10);
                AddNewProduct("Smart TV", 1000, 10);
                AddNewProduct("Toilet paper", 20, 1000);
                AddNewProduct("Product 10", 20, 500);
            }
        }

        private ContractMetaInfo GetContractInfo()
        {
            var json = System.IO.File.ReadAllText("C:\\Users\\volland\\source\\repos\\EthereumMarketplace\\Contracts\\build\\contracts\\Marketplace.json");
            return JsonConvert.DeserializeObject<ContractMetaInfo>(json);
        }

        public void AddNewProduct(string productname, long priceInFinney, long quantity)
        {
            var price = Nethereum.Util.UnitConversion.Convert.ToWei(priceInFinney, Nethereum.Util.UnitConversion.EthUnit.Finney);
            var addNewProductRequest = GetContract().GetFunction("newProduct");
            var result = addNewProductRequest.SendTransactionAsync(_account.Address, DefaultGas, Zero,productname, (long)price, quantity).GetAwaiter().GetResult();
        }

        public ICollection<string> GetAllProductIDs()
        {            
            var getProducts = GetContract().GetFunction("getProducts");
            var result = getProducts.CallAsync<List<byte[]>>().GetAwaiter().GetResult();
            return result.Select(bytes => (new System.Numerics.BigInteger(bytes)).ToString()).ToList(); 
        }

        public ProductInfo GetProduct(string id)
        {
            var idInBytes = System.Numerics.BigInteger.Parse(id).ToByteArray();
            var getProduct = GetContract().GetFunction("getProduct");
            var result = getProduct.CallDeserializingToObjectAsync<ProductInfo>(idInBytes).GetAwaiter().GetResult();
            return result;
        }

        public ICollection<Product> GetAllProducts()
        {
            List<Product> result = new List<Product>();
            var allids = GetAllProductIDs();
            foreach (var id in allids)
            {
                var productInfo = GetProduct(id);

                result.Add(new Product() {
                    Id = id,
                    Name = productInfo.Name,
                    Price = productInfo.PriceInWei,
                    Quantity = productInfo.Quantity
                });
            }

            return result;
        }

        private Contract GetContract()
        {

            return _web3.Eth.GetContract(_contractInfo.GetAbi(), contractAddress);
        }
        
    }
}
