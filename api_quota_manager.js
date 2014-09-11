'use strict';

var Q = require('q');

var ApiQuotaManager = function(params){
  this.api_call = params.translate;
  this.strategy = params.strategy;
  this.retry_delay = (params.retry_delay || 60) * 1000;
};

ApiQuotaManager.prototype.call = function(params, callback, eventsCallback){
  var self = this;
  this.api_call(params, function(error, data, status){
      if (error){
        callback(error, null);
      } else {
        if (status.retry_delay){
          self.retry_delay = status.retry_delay * 1000;
        }

        if (status.quota){
          if (self.strategy == "retry"){
            var message = 'Rate limit reached. Retrying in ' + Math.ceil(self.retry_delay/1000) + ' seconds';
            if (eventsCallback) eventsCallback('retrying', message);
            setTimeout(function(){
                self.call(params, callback);
              }, self.retry_delay);
          } else {
            callback("Rate limit exceeded", null);
          }
        } else {
          callback(error, data);
        }
      }
    });
};

ApiQuotaManager.prototype.getLimitInfo = function(){
  return {
    retry_delay: (this.retry_delay / 1000)
  };
};

module.exports = ApiQuotaManager;
