var chai = require("chai");
var expect = chai.expect;

var Q = require('q');
var AQM = require("../api_quota_manager.js");
var api_mock = require("./api_mock.js");

describe('ApiQuotaManager', function(){
    this.timeout(30000);

    //wrapper functions around the API to be used by the proxy
    var mockapi_call = function(params, proxy_callback){
      api_mock.get(params.nom, params.prenom, function(error, data, response){
          var status = {quota:false};
          if (response == "500" || error == "Limit reached"){
            error = null;
            status.quota = true;
          }
          proxy_callback(error, data, status);
        });
    };

    it('should return a valid object', function(){
        var api_proxy = new AQM({
            translate: mockapi_call
          });

        expect(typeof(api_proxy.call)).to.equal('function');
      });

    describe('call()', function(){
        it('should call the api whith all parameters', function(done){
            var api_proxy = new AQM({
                translate: mockapi_call
              });

            var params = {nom: "john", prenom:"doe" };


            api_mock.get(params.nom, params.prenom, function(error, data, response){
                api_proxy.call(params, function(err, res, finish){
                    expect(res).to.equal(data);
                    finish();
                    done();
                  });
              });

            // api_mock.get(params.nom, params.prenom, function(error, data, response){
            //     api_proxy.call(params, function(err, res){return res;}).then(function(res){
            //         expect(res).to.equal(data);
            //         done();
            //       }).done();
            //   });
          });

        it('should update retry delay', function(done){
            var retry_delay = 3600;

            var api_proxy = new AQM({
                translate: function(params, proxy_callback){
                  api_mock.get(params.nom, params.prenom, function(error, data, response){
                      var status = {
                        quota:false,
                        retry_delay: retry_delay,
                      };
                      proxy_callback(error, data, status);
                    });
                }
              });

            api_proxy.call({nom: "john", prenom:"doe" }, function(err, res, finish){
                var limitInfo = api_proxy.getLimitInfo();
                expect(limitInfo.retry_delay).to.equal(retry_delay);
                finish();
                done();
              });
          });

        it('should allow recursive async usages', function(done){
            var retry_delay = 3600;

            var api_proxy = new AQM({
                translate: function(params, proxy_callback){
                  api_mock.get(params.nom, params.prenom, function(error, data, response){
                      var status = {
                        quota:false,
                        retry_delay: retry_delay,
                      };
                      proxy_callback(error, data, status);
                    });
                }
              });

            api_proxy.call({nom: "john", prenom:"doe" }, function(err, res, finish){
                var limitInfo = api_proxy.getLimitInfo();
                expect(limitInfo.retry_delay).to.equal(retry_delay);
                finish();
                done();
              });
          });
    });

    describe('strategy : retry', function(){
        it('should retry', function(done){
            var api_proxy = new AQM({
                translate: mockapi_call,
                strategy: 'retry',
                retry_delay: 2
              });

          var params = {nom: "john", prenom:"doe" };
          var promises = [];

          for (var i=0;i<15;i++){
            promises.push(api_proxy.call(params, function(err, res, finish){
                  finish();
                }));
          }
          Q.all(promises).then(function(results){
              expect(true);
              done();
            }).fail(function(err){
                expect(err).to.not.exist;
              }).done();
        });
    });

    describe('strategy : abort', function(){
        it('should abort', function(done){
            var api_proxy = new AQM({
                translate: mockapi_call,
                strategy: 'abort',
                retry_delay: 2
              });

          var params = {nom: "john", prenom:"doe" };
          var promises = [];
          var promise;

          for (var i=0;i<15;i++){
            promise = api_proxy.call(params, function(){});
            promise.progress(function(data){
                expect(data.status).to.not.equal('retrying');
              });
            promises.push(promise);
          }
          Q.all(promises).then(function(results){
              done();
            }).fail(function(err){
                done();
              }).done();
        });
    });
});
