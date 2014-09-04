var chai = require("chai");
var expect = chai.expect;

var Q = require('q');
var AQM = require("../api_quota_manager.js");

describe('ApiQuotaManager', function(){

    //A public API mock
    var limit = 5;
    var call_count = 0;

    function resetCount(){
      call_count = 0;
      setTimeout(resetCount, 5000);
    }
    resetCount();

    var mockapi = function(nom, prenom, callback){
      var error = null;
      var response = "200 OK";
      var data = "";
      if (call_count++ > limit){
        error = "Limit reached";
        response = "500";
      } else {
        // console.log(call_count);
        data = 'hello ' + nom +" "+prenom;
      }
      callback(error, data, response);
    };

    //wrapper functions around the API to be used by the proxy
    var mockapi_call = function(params, proxy_callback){
      mockapi(params.nom, params.prenom, function(error, data, response){
          var quota = false;
          if (response == "500" || error == "Limit reached"){
            error = null;
            quota = true;
          }
          proxy_callback(error, quota, data);
        });
    };

    var manage_results = function(err, data){
      if (err) {
      } else {
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
        this.timeout(30000);
        it('should call the api whith all parameters', function(done){
            var params = {nom: "john", prenom:"doe" };

            mockapi(params.nom, params.prenom, function(error, data, response){
                api_proxy.call(params).then(function(res){
                    expect(res).to.equal(data);
                    done();
                  }).done();
              });
          });

        it('should retry', function(done){
          var params = {nom: "john", prenom:"doe" };
          var promises = [];

          for (var i=0;i<15;i++){
            promises.push(api_proxy.call(params));
          }
          Q.all(promises).then(function(results){
              expect(true);
              done();
            }).fail(function(err){
                console.log(err)
              }).done();
        });
    });
});
