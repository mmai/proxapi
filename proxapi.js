'use strict';

/**
 * Initialize an instance of ProxAPI with a strategy, an optional retry delay and a _translate_ function which must have the following structure :  
 *
 *     function(params, handleResults){ 
 *       // Modify the following line to call the desired API 
 *       some_api.some_request(some_parameters, function(some_return_values) {
 *         var proxapiStatus = { quota: false };
 *         var err = null;
 *      
 *         // Transformation from the API response format to the handleResults format
 *         // Do something here with the API return values and compute _err_, _results_ and _proxapiStatus_
 *      
 *         //Finally return to ProxAPI
 *         handleResults(err, results, proxapiStatus); 
 *       });
 *     }
 *
 *  This function : 
 *  * calls the API with parmaters collected in _params_ object
 *  * gets the results
 *  * catch errors and detect quota limits
 *  * returns to ProxAPI by calling _handleResults_ with the following arguments:
 *    * _err_ : errors not associated to usage limitations
 *    * _results_ : API request results
 *    * _proxapiStatus_ : information about the request, you must set at least _proxapiStatus.quota_ boolean value ( _true_ if the request failed due to usage limitations, _false_ if there wasn't any quota error).
 *
 * @namespace
 * @constructor
 * @param {object} settings - Settings of the proxy
 * @param {string} settings.strategy - Strategy to apply when a quota limit is reached. Possible values : 
 *   * "retry" : wait for the end of the limited period and retry
 *   * "abort" : abort the request and return an informative error message
 * @param {integer} settings.retryDelay - Retry delay in seconds
 * @param {function} settings.translate - Interface beetween ProxAPI and the API, allowing ProxAPI to call the API and to understand the results.  
 */
var ProxAPI = function(settings){
  this.apiCall = settings.translate;
  this.strategy = settings.strategy;

  /**
   * Retry_delay Retry delay in milliseconds
   * @member {integer} 
   * @default 60000
   */
  this.retryDelay = (settings.retryDelay || 60) * 1000;
};

/**
 * Calls the API and apply the strategy defined at the ProxAPI initialization if it encounter a quota limit.  
 * Calls the _onEvent_ method if provided to notice when such cases occur.  
 * Finally calls the _onEnd_ function whith the API results
 *
 * @param {ProxAPI~onEnd} onEnd - Callback function called after the API call has been made
 * @param {ProxAPI~onEvent} [onEvent] - Callback function called each time an event occurs
 */
ProxAPI.prototype.call = function(params, onEnd, onEvent){
  var self = this;
  this.apiCall(params, function(error, data, status){
      if (error){
        onEnd(error, null);
      } else {
        if (status.retryDelay){
          self.retryDelay = status.retryDelay * 1000;
        }

        if (status.quota){
          if (self.strategy == "retry"){
            var message = 'Rate limit reached. Retrying in ' + Math.ceil(self.retryDelay/1000) + ' seconds';
            if (onEvent) onEvent('retrying', message);
            setTimeout(function(){
                self.call(params, onEnd);
              }, self.retryDelay);
          } else {
            onEnd("Rate limit exceeded", null);
          }
        } else {
          onEnd(error, data);
        }
      }
    });
};
/**
 * @callback ProxAPI~onEnd
 * @param {string} error
 * @param {object} data - API request results
 */

/**
 * @callback ProxAPI~onEvent
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
    retryDelay: (this.retryDelay / 1000)
  };
};

/**
    @memberof ProxAPI
    @typedef LimitInfo
    @type {object}
    @property {integer} retryDelay - Number of seconds to wait before retrying a call to the API
 */

module.exports = ProxAPI;
