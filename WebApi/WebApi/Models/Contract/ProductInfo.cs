using Nethereum.ABI.FunctionEncoding.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Models.Contract
{
    [FunctionOutput]
    public class ProductInfo
    {
        [Parameter("string", "name", 1)]
        public string Name { get; set; }

        [Parameter("uint256", "price", 2)]
        public long PriceInWei { get; set; }

        [Parameter("uint256", "quantity", 3)]
        public long Quantity { get; set; }
    }
}
