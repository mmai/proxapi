'use strict';

var Q = require('q');

/**
 * ProxAPI must be initialized with a _settings_ object containing :
 *   * translate {function} Interface beetween ProxAPI and the API
 *   * strategy {string} Strategy to apply when a quota limit is reached
 *   * retry_delay {integer} Retry delay in seconds
 * @class ProxAPI
 * @constructor
 * @param settings {Object} Settings of the proxy
 */
var ProxAPI = function(settings){
  /**
   * A function allowing to call the API and to understand the results.  
   * It has the following structure :  
   *
   *     function(params, proxy_callback){ 
   *       // Modify the following line to call the desired API 
   *       some_api.some_request(some_parameters, function(some_return_values) {
   *         var proxapi_status = { quota: false };
   *         var err = null;
   *      
   *         // Transformation from the API response format to the proxy_callback format
   *         // Do something here with the API return values and compute _err_, _results_ and _proxapi\_status_
   *      
   *         //Finally return to ProxAPI
   *         proxy_callback(err, results, proxapi_status); 
   *       });
   *     }
   *
   * It follows this scenario : 
   * * call the API with the _params_ parameters 
   * * get the results
   * * catch errors and detect quota limits
   * * return to ProxAPI by calling _proxy\_callback_ with the following arguments:
   *   * _err_ : errors not associated to usage limitations
   *   * _results_ : API request results
   *   * _proxapi\_status_ : information about the request, you must set at least _proxapi\_status.quota_ boolean value ( _true_ if the request failed due to usage limitations, _false_ if there wasn't any quota error).
   * 
   * @property api_call
   * @type Function
   */
  this.api_call = settings.translate;

  /**
   * Strategy to apply when a quota limit is reached.  
   * Possible values : 
   *   * "retry" : wait for the end of the limited period and retry
   *   * "abort" : abort the request and return an informative error message
   *
   * @property strategy
   * @type String
   */
  this.strategy = settings.strategy;

  /**
   * Retry delay in milliseconds
   *
   * @property retry_delay
   * @type Integer
   * @default 60000
   */
  this.retry_delay = (settings.retry_delay || 60) * 1000;
};

/**
 * Calls the API and apply the strategy defined at the ProxAPI initialization if it encounter a quota limit.  
 * Calls the _eventsCallback_ method if provided to notice when such cases occur.  
 * Finally calls the _callback_ function whith the API results
 *
 * @method call
 * @param callback {Function} Callback function called after the API call has been made
 * @param [eventsCallback] {Function} Callback function called each time an event occurs
 */
ProxAPI.prototype.call = function(params, callback, eventsCallback){
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

/**
 * Provides informations about the API limitations
 *   * retry_delay {Integer}: the number of seconds to wait before retrying a call to the API
 *
 * @method getLimitInfo
 * @return {Object} Informations about the API limitations.
 */
ProxAPI.prototype.getLimitInfo = function(){
  return {
    retry_delay: (this.retry_delay / 1000)
  };
};

module.exports = ProxAPI;
