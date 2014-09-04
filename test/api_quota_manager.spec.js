var chai = require("chai");
var expect = chai.expect;

var AQM = require("../api_quota_manager.js");

describe('ApiQuotaManager', function(){

    //A public API mock
    var mockapi = function(nom, prenom, callback){
      var error = null;
      var data = 'hello ' + nom +" "+prenom;
      var response = "200 OK";
      callback(error, data, response);
    };

    //wrapper functions around the API to be used by the proxy
    var mockapi_call = function(params, proxy_callback){
      mockapi(params.nom, params.prenom, function(error, data, response){
          var quota = false;
          if (response == "500"){
            quota = true;
          }
          proxy_callback(error, quota, data);
        });
    };

    var manage_results = function(err, data){
      if (err) {
        console.log('Error : ' + err);
      } else {
        console.log("==== " +  data + " ======");
      }
      return data;
    };

    //Instantiate the proxy with the wrapper functions
    var api_proxy = new AQM({
        call: mockapi_call,
        callback: manage_results,
        strategy: 'none'
      });

    // beforeEach(function(){ });

    it('should return a valid object', function(){
        expect(typeof(api_proxy.call)).to.equal('function');
      });

    describe('call()', function(){
        it('should call the api whith all parameters', function(done){
            var params = {nom: "john", prenom:"doe" };

            mockapi(params.nom, params.prenom, function(error, data, response){
                api_proxy.call(params).then(function(err, res){
                    expect(res).to.equal(data);
                    done();
                  });
              });
          });
      });
  });



