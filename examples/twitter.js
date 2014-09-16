'use strict';

var Q = require('q');
var credentials = require('./twitter_credentials.js');

var Twit = require('twit');
var twit = new Twit(credentials);

var ProxAPI = require("../proxapi.js");

var twitterProxy = new ProxAPI({
  strategy: 'retry',
  retryDelay: 60*5,
  translate: function(params, proxyCallback){
    twit.get("followers/list", {screen_name: params.twitter_account, count: 50, cursor: params.cursor}, function (err, data, response) {
        var status = {
          quota: false
        };
        if (response.statusCode === 429 || (err && err.message === "Rate limit exceeded")){
          err = null;
          status.quota = true;
          status.retryDelay = response.headers['x-rate-limit-reset'] - (Date.now()/1000) ;
        }
        proxyCallback(err, data, status);
      });
  }
});

var showEvents = function(eventName, data){
  if (eventName === "retrying"){
    console.log(data);
  }
};

function getFollowers(twitterAccount, cursor){
  cursor = cursor || -1;
  console.log('Fetching twitter cursor ' + cursor);
  var deferred = Q.defer();
  var params = {
    twitter_account: twitterAccount,
    cursor: cursor
  }

  twitterProxy.call(params, function(err, data){
      if (err) {
        deferred.reject(err);
      } else {
        if (data.next_cursor_str == '0'){
          //All result pages have been fetched
          deferred.resolve(data.users);
        } else {
          //There are more result pages to fetch
          getFollowers(twitterAccount, data.next_cursor_str)
          .fail(deferred.reject)
          .progress(function(data){ console.log(data.message); })
          .then(function(users){
              deferred.resolve(data.users.concat(users));
            });
        }
      }
    }, showEvents);

  return deferred.promise;
}

getFollowers("mmai")
    .fail(function(error){ console.log(error); })
    .progress(function(data){ console.log(data.message); })
    .then(function(followers){
      console.log("Total followers: " + followers.length);
    })
    .done();
