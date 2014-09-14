'use strict';

/**
 * Initialize an instance of ProxAPI with a strategy, a optional retry delay setting and a _translate_ function which must have the following structure :  
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
 *  Here is what this function do : 
 *  * call the API with parmaters collected in _params_ object
 *  * get the results
 *  * catch errors and detect quota limits
 *  * return to ProxAPI by calling _proxy\_callback_ with the following arguments:
 *    * _err_ : errors not associated to usage limitations
 *    * _results_ : API request results
 *    * _proxapi\_status_ : information about the request, you must set at least _proxapi\_status.quota_ boolean value ( _true_ if the request failed due to usage limitations, _false_ if there wasn't any quota error).
 *
 * @namespace
 * @constructor
 * @param {object} settings - Settings of the proxy
 * @param {string} settings.strategy - Strategy to apply when a quota limit is reached. Possible values : 
 *   * "retry" : wait for the end of the limited period and retry
 *   * "abort" : abort the request and return an informative error message
 * @param {integer} settings.retry_delay - Retry delay in seconds
 * @param {function} settings.translate - Interface beetween ProxAPI and the API, allowing ProxAPI to call the API and to understand the results.  
 */
var ProxAPI = function(settings){
  this.api_call = settings.translate;
  this.strategy = settings.strategy;

  /**
   * Retry_delay Retry delay in milliseconds
   * @member {integer} 
   * @default 60000
   */
  this.retry_delay = (settings.retry_delay || 60) * 1000;
};

/**
 * Calls the API and apply the strategy defined at the ProxAPI initialization if it encounter a quota limit.  
 * Calls the _eventsCallback_ method if provided to notice when such cases occur.  
 * Finally calls the _callback_ function whith the API results
 *
 * @param {ProxAPI~callback} callback - Callback function called after the API call has been made
 * @param {ProxAPI~eventsCallback} [eventsCallback] - Callback function called each time an event occurs
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
 * @callback ProxAPI~callback
 * @param {string} error
 * @param {object} data - API request results
 */

/**
 * @callback ProxAPI~eventsCallback
 * @param {string} eventName - Name of the event (ie "retrying")
 * @param {string} data  - Event message
 */


/**
 * Provides informations about the API limitations
 *
 * @return {LimitInfo} infos - Informations about the API limitations {@link ProxAPI.LimitInfo}
 */
ProxAPI.prototype.getLimitInfo = function(){
  return {
    retry_delay: (this.retry_delay / 1000)
  };
};

/**
    @memberof ProxAPI
    @typedef LimitInfo
    @type {object}
    @property {integer} retry_delay - Number of seconds to wait before retrying a call to the API
 */

module.exports = ProxAPI;