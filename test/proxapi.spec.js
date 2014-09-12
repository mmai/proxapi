var chai = require("chai");
var expect = chai.expect;
var inspect = require('util').inspect;

var Q = require('q');
var ProxAPI = require("../proxapi.js");
var api_mock = require("./api_mock.js");

describe('ProxAPI', function(){
    this.timeout(15000);

    //wrapper functions around the API to be used by the proxy
    var mockapi_call = function(params, proxy_callback){
      api_mock.get(params.name, params.page, function(error, data, response){
          var status = {quota:false};
          if (response == "500" || error == "Limit reached"){
            error = null;
            status.quota = true;
          }
          proxy_callback(error, data, status);
        });
    };

    it('should return a valid object', function(){
        var api_proxy = new ProxAPI({
            translate: mockapi_call
          });

        expect(typeof(api_proxy.call)).to.equal('function');
      });

    describe('call()', function(){
        it('should call the api whith all parameters', function(done){
            var api_proxy = new ProxAPI({
                translate: mockapi_call
              });

            var params = {name: "john", page:1};

            api_mock.get(params.name, params.page, function(error, data, response){
                api_proxy.call(params, function(err, res, finish){
                    expect(res).to.deep.equal(data);
                    // finish();
                    done();
                  });
              });
          });

        it('should update retry delay', function(done){
            var retry_delay = 3600;

            var api_proxy = new ProxAPI({
                translate: function(params, proxy_callback){
                  api_mock.get(params.name, params.page, function(error, data, response){
                      var status = {
                        quota:false,
                        retry_delay: retry_delay,
                      };
                      proxy_callback(error, data, status);
                    });
                }
              });

            api_proxy.call({name: "john", page:1}, function(err, res, finish){
                var limitInfo = api_proxy.getLimitInfo();
                expect(limitInfo.retry_delay).to.equal(retry_delay);
                // finish();
                done();
              });
          });

        it('should allow recursive async usages', function(done){
            var api_proxy = new ProxAPI({
                translate: mockapi_call,
                strategy: 'retry',
                retry_delay: 2
              });

            //A recursive function to display all pages
            var getPages = function(name, frompage){
              var deferred = Q.defer();
              api_proxy.call({name: "john", page:frompage}, function(err, res, finish){
                  if (err) {
                    deferred.reject(err);
                  } else {
                    if (res.nextpage === -1){
                      deferred.resolve([res.info]);
                      // finish();
                    } else {
                      getPages(name, res.nextpage).fail(deferred.reject).then(function(nextInfos){
                          deferred.resolve([res.info].concat(nextInfos));
                          // finish();
                        });
                    }
                  }
                // }).then(function(res){
                  });
              return deferred.promise;
            };

            getPages('john', 0).fail(function(err){
                expect(err).to.not.exist;
                done();
              }).then(function(res){
                  expect(res).to.deep.equal(["a", "b", "c", "d"]);
                  done();
              });
          });
    });

    describe('strategy : retry', function(){
        it('should retry', function(done){
            var api_proxy = new ProxAPI({
                translate: mockapi_call,
                strategy: 'retry',
                retry_delay: 2
              });

          var params = {name: "john", page:1};

          var counter = 0;
          var iterations = 15;
          for (var i=0;i<iterations;i++){
            api_proxy.call(params, function(error, data){
                if (error) expect(error).to.not.exist;
                counter += 1;
                if (counter >= iterations){
                  done();
                }
              }, function(eventName, data){
                if (eventName === 'retrying'){
                  // console.log(data);
                }
              });
          }

        });
    });

    describe('strategy : abort', function(){
        it('should abort', function(done){
            var api_proxy = new ProxAPI({
                translate: mockapi_call,
                strategy: 'abort',
                retry_delay: 2
              });

          var params = {name: "john", page:1};

          var counter = 0;
          var iterations = 15;

          for (var i=0;i<iterations;i++){
            api_proxy.call(params, function(error, data){
                counter += 1;
                if (counter >= iterations){
                  done();
                }
              }, function(eventName, data){
                if (eventName === 'retrying'){
                console.log("abort but retrying event : " + message);
                expect(true).to.be.false;
                }
              });
          }

        });
    });
});
