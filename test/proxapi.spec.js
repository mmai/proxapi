var chai = require("chai");
var expect = chai.expect;
var inspect = require('util').inspect;

var Q = require('q');
var ProxAPI = require("../proxapi.js");
var apiMock = require("./api_mock.js");

describe('ProxAPI', function(){
    this.timeout(15000);

    //wrapper functions around the API to be used by the proxy
    var mockapiCall = function(params, handleResults){
      apiMock.get(params.name, params.page, function(error, data, response){
          var status = {quota:false};
          if (response == "500" || error == "Limit reached"){
            error = null;
            status.quota = true;
          }
          handleResults(error, data, status);
        });
    };

    it('should return a valid object', function(){
        var apiProxy = new ProxAPI({
            translate: mockapiCall
          });

        expect(typeof(apiProxy.call)).to.equal('function');
      });

    describe('call()', function(){
        it('should call the api whith all parameters', function(done){
            var apiProxy = new ProxAPI({
                translate: mockapiCall
              });

            var params = {name: "john", page:1};

            apiMock.get(params.name, params.page, function(error, data, response){
                apiProxy.call(params, {}, function(err, res){
                    expect(res).to.deep.equal(data);
                    done();
                  });
              });
          });

        it('should update retry delay', function(done){
            var retryDelay = 3600;

            var apiProxy = new ProxAPI({
                translate: function(params, handleResults){
                  apiMock.get(params.name, params.page, function(error, data, response){
                      var status = {
                        quota:false,
                        retryDelay: retryDelay,
                      };
                      handleResults(error, data, status);
                    });
                }
              });

            apiProxy.call({name: "john", page:1}, {strategy:"abort"},  function(err, res){
                var limitInfo = apiProxy.getLimitInfo();
                expect(limitInfo.retryDelay).to.equal(retryDelay);
                done();
              });
          });

        it('should allow recursive async usages', function(done){
            var apiProxy = new ProxAPI({
                translate: mockapiCall,
                retryDelay: 2
              });

            //A recursive function to display all pages
            var getPages = function(name, frompage){
              var deferred = Q.defer();
              apiProxy.call({name: "john", page:frompage}, {strategy:"retry"}, function(err, res){
                  if (err) {
                    deferred.reject(err);
                  } else {
                    if (res.nextpage === -1){
                      deferred.resolve([res.info]);
                    } else {
                      getPages(name, res.nextpage).fail(deferred.reject).then(function(nextInfos){
                          deferred.resolve([res.info].concat(nextInfos));
                        });
                    }
                  }
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
            var apiProxy = new ProxAPI({
                translate: mockapiCall,
                retryDelay: 2
              });

          var params = {name: "john", page:1};
          var onEvent = function(eventName, data){
            if (eventName === 'retrying'){
              // console.log(data);
            }
          };

          var counter = 0;
          var iterations = 15;
          for (var i=0;i<iterations;i++){
            apiProxy.call(params, {strategy:"retry", onEvent: onEvent}, function(error, data){
                if (error) expect(error).to.not.exist;
                counter += 1;
                if (counter >= iterations){
                  done();
                }
              });
          }

        });
    });

    describe('strategy : abort', function(){
        it('should abort', function(done){
          var apiProxy = new ProxAPI({
              translate: mockapiCall,
              retryDelay: 2
            });

          var params = {name: "john", page:1};
          var onEvent = function(eventName, data){
            if (eventName === 'retrying'){
              console.log("abort but retrying event : " + message);
              expect(true).to.be.false;
            }
          };

          var counter = 0;
          var iterations = 15;

          for (var i=0;i<iterations;i++){
            apiProxy.call(params, {strategy:"abort", onEvent: onEvent}, function(error, data){
                counter += 1;
                if (counter >= iterations){
                  done();
                }
              });
          }

        });
    });

  describe('callUntil', function(){
      it('should aggregate api calls results until a condition has been fulfilled', function(done){
          var apiProxy = new ProxAPI({
              translate: mockapiCall,
              retryDelay: 2
            });

          var endCondition = function(error, data){
            return data.nextpage === -1;
          }; 

          var newParams = function(error, data, params){
            return {
              name: params.name,
              page: data.nextpage
            };
          };
          
          var aggregate = function(acc, res){
            return acc.concat([res.info]);
          };

          var params = {name: "john", page:0};
          apiProxy.callUntil(params, {strategy:"retry"}, function(error, data){
              expect(data).to.deep.equal(["a", "b", "c", "d"]);
              done();
            }, {newParams: newParams, aggregate: aggregate, endCondition: endCondition });
        });
    });
});
