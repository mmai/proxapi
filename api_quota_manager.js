'use strict';

var Q = require('q');

var ApiQuotaManager = function(params){
  this.api_call = params.translate;
  this.strategy = params.strategy;
  this.retry_delay = (params.retry_delay || 60) * 1000;
};

ApiQuotaManager.prototype.call = function(params, callback){
  var self = this;
  var deferred = Q.defer();
  this.api_call(params, function(error, data, status){
      if (error){
        deferred.reject(error);
      } else {
        if (status.retry_delay){
          self.retry_delay = status.retry_delay * 1000;
        }

        if (status.quota){
          if (self.strategy == "retry"){
            deferred.notify({
                status: 'retrying',
                message:'Rate limit reached. Retrying in ' + Math.ceil(self.retry_delay/1000) + ' seconds'
              });
            setTimeout(function(){
                self.call(params, callback).then(deferred.resolve).fail(deferred.reject);
              }, self.retry_delay);
          } else {
            deferred.reject("Rate limit exceeded");
          }
        } else {
          callback(error, data, deferred.resolve);
        }
      }
    });
  return deferred.promise;
};

ApiQuotaManager.prototype.getLimitInfo = function(){
  return {
    retry_delay: (this.retry_delay / 1000)
  };
};

module.exports = ApiQuotaManager;
