<template>
  <article>
        <div>        
            <div v-if="isLoading" class="pageLoader"></div>            
            <div class="row">
              <div class="col-sm-6 game" v-for="product in products" v-bind:key="product.id">
                <div class="card">
                  <div class="card-header">
                    <h3>{{product.name}}</h3>
                  </div>
                  <div class="card-body">
                    <p class="card-text">Price: {{ product.priceFormated }} eth</p>
                    <p class="card-text">Quantity: {{ product.quantity }}</p>                                      
                  </div>
                  <div class="card-footer">      
                     <div v-if="product.isloading">
                          in progress
                     </div>
                    <div v-else class="row">                         
                      <div class="col-md-4">
                        <input type="number" class="form-control" v-model="product.desiredQuantity" />  
                      </div>         
                      <div class="col-md-4">
                          <button class="btn btn-primary" v-on:click="buy(product)">Buy item</button>                    
                      </div>
                     </div>
                  </div>
                </div>
              </div>
            </div> 
        </div>
  </article>
</template>

<script>
import EthLightwallet from 'eth-lightwallet'
import HookedWeb3Provider from 'web3'
import Web3 from 'web3'
import Wallet from '../../static/js/wallet'
import apiService from '../services/apiService'

export default {
  name: 'HelloWorld',
  data () {
        return {
            contractInstance : {},
            products : [],
           isLoading : true,
           hasError: false,
           errorText: '',
           success: false
        }
      },
  methods : {      
        loadOpenGames(){
          var self = this;
            apiService.get(this.$http, 'product', 'all').then(result => {
               self.products = result.body;
               self.products.forEach(function(element) {
                element.desiredQuantity = 0;
                element.isloading = false;
              });
               self.isLoading = false;
            }, error => {
              console.log(error)
            });
        },
        buy(product){
          var self = this;                 
          self.hasError = false;   
          self.success = false; 
          alert(product.desiredQuantity);
          let valuToPay = product.desiredQuantity * product.price;
          this.contractInstance.buy(product.id, product.desiredQuantity
              ,{from: web3.eth.defaultAccount, gas: 3000000, value: valuToPay},function(error,result){
                console.log(error);
                if(error){
                    var trimlength = error.message.length < 100 ? error.message.length : 100;
                    self.errorText = error.message.substring(0,trimlength);
                    self.hasError = true;
                }
                else{
                  self.success = true;         
                }
                product.isloading = false;
                setTimeout(() => {
                  self.loadOpenGames();
                }, 2000);
            });

        }        
  },
  created () {
              var self = this;
              apiService.get(this.$http, 'contract', 'metadata').then(result => {
                let contractMetadata = result.body;
                let contract = web3.eth.contract(JSON.parse(contractMetadata.abi));
                self.contractInstance = contract.at(contractMetadata.address);
              }, error => {
                console.log(error)
              });
            this.loadOpenGames();
  },
  filters: {
    toEthers: function (value) {
      if (!value) return ''      
      return web3.fromWei(value, 'ether')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
