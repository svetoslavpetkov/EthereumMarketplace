using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApi.Util;

namespace WebApi.Models.Dto
{
    public class Product
    {
        public string Id { get; set; }

        public string Name { get; set; }

        public string PriceFormated { get { return ConvertUtil.GetFormatted(Price); } }

        public long Price { get; set; }

        public long Quantity { get; set; }
    }
}
