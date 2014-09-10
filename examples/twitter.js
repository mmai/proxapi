'use strict';

var Q = require('q');
var credentials = require('./twitter_credentials.js');

var Twit = require('twit');
var twit = new Twit(credentials);

var AQM = require("../api_quota_manager.js");

var twitter_proxy = new AQM({
  strategy: 'retry',
  retry_delay: 60*5,
  translate: function(params, proxy_callback){
    twit.get("followers/list", {screen_name: params.twitter_account, count: 50, cursor: params.cursor}, function (err, data, response) {
        var status = {
          quota: false
        };
        if (response.statusCode === 429 || (err && err.message === "Rate limit exceeded")){
          err = null;
          status.quota = true;
          status.retry_delay = response.headers['x-rate-limit-reset'] - (Date.now()/1000) ;
        }
        proxy_callback(err, data, status);
      });
  }
});


function getFollowers(twitter_account, cursor){
  cursor = cursor || -1;
  console.log('Fetching twitter cursor ' + cursor);
  var deferred = Q.defer();
  var params = {
    twitter_account: twitter_account,
    cursor: cursor
  }

  twitter_proxy.call(params, function(err, data, done){
      if (err) {
        deferred.reject(err);
      } else {
        if (data.next_cursor_str == '0'){
          //All result pages have been fetched
          deferred.resolve(data.users);
          done();
        } else {
          //There are more result pages to fetch
          getFollowers(twitter_account, data.next_cursor_str)
          .fail(deferred.reject)
          .progress(function(data){ console.log(data.message); })
          .then(function(users){
              deferred.resolve(data.users.concat(users));
              done();
            });
        }
      }
    })
  .progress(function(data){ console.log(data.message); })
  .then(function(users){ deferred.resolve(users); });

  return deferred.promise;
}

getFollowers("mmai")
    .fail(function(error){ console.log(error); })
    .progress(function(data){ console.log(data.message); })
    .then(function(followers){
      console.log("Total followers: " + followers.length);
    })
    .done();
