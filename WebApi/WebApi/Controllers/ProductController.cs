using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using WebApi.Services;

namespace WebApi.Controllers
{
    [Produces("application/json")]
    [Route("api/product")]
    public class ProductController : Controller
    {
        private ContractService contactService;

        public ProductController(ContractService contactService)
        {
            this.contactService = contactService;
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok("HI there");
        }

        [HttpGet("all")]
        public IActionResult GetAll()
        {
            return Ok(contactService.GetAllProducts());
        }

        [HttpGet("{productID}")]
        public IActionResult GetOneProduct(string productID)
        {
            return Ok(contactService.GetProduct(productID));
        }
    }
}