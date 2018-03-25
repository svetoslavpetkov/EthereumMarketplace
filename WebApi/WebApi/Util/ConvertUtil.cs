using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace WebApi.Util
{
    public static class ConvertUtil
    {
        public static DateTime GetDate(long solidityValue)
        {
            return new DateTime(1970, 1, 1).AddSeconds(solidityValue).ToLocalTime();
        }

        public static string GetDateString(long solidityValue)
        {
            return GetDate(solidityValue).ToString("yyyy/M/d hh:mm");
        }

        private static readonly long OneEther = (long)Nethereum.Util.UnitConversion.Convert.ToWei(1, Nethereum.Util.UnitConversion.EthUnit.Ether);


        private static readonly NumberFormatInfo _numberFormatInfo = new NumberFormatInfo() { NumberDecimalSeparator = DecimalDelimeterString };

        public static char DecimalDelimeter => '.';

        public static string DecimalDelimeterString => DecimalDelimeter.ToString();

        public static string GetFormatted(long wei)
        {
            decimal wholePart = wei / (decimal)OneEther;
            return wholePart.ToString(_numberFormatInfo);
        }

    }
}
