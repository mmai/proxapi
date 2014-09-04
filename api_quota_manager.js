var Q = require('q');

ApiQuotaManager = function(params){
  this.api_call = params.call;
  this.api_callback = params.callback;
  this.strategy = params.strategy;
};

ApiQuotaManager.prototype.call = function(params){
  var self = this;
  var deferred = Q.defer();
  this.api_call(params, function(error, quota, data){
      if (error){
        deferred.reject(error);
      }
      console.log("on resolve...");
      deferred.resolve(null, self.api_callback(error, data));
  });
  return deferred.promise;
};

module.exports = ApiQuotaManager;
