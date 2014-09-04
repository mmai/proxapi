var Q = require('q');

ApiQuotaManager = function(params){
  this.api_call = params.call;
  this.api_callback = params.callback;
  this.strategy = params.strategy;
};

ApiQuotaManager.prototype.call = function(params, iter){
  var self = this;
  var deferred = Q.defer();
  this.api_call(params, function(error, quota, data){
      if (error){
        deferred.reject(error);
      }
      if (quota){
        setTimeout(function(){
            deferred.resolve(self.call(params, iter));
          }, 5000);
      } else {
        deferred.resolve(self.api_callback(error, data));
      }
  });
  return deferred.promise;
};

module.exports = ApiQuotaManager;
