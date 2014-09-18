'use strict';

var Q = require('q');
var credentials = require('./twitter_credentials.js');

var Twit = require('twit');
var twit = new Twit(credentials);

var ProxAPI = require("../proxapi.js");

var twitterProxy = new ProxAPI({
  retryDelay: 60*5,
  translate: function(params, handleResults){
    twit.get("followers/list", {screen_name: params.twitter_account, count: 50, cursor: params.cursor}, function (err, data, response) {
        var status = {
          quota: false
        };
        if (response.statusCode === 429 || (err && err.message === "Rate limit exceeded")){
          err = null;
          status.quota = true;
          status.retryDelay = response.headers['x-rate-limit-reset'] - (Date.now()/1000) ;
        }
        handleResults(err, data, status);
      });
  }
});

var params = {
  twitter_account: "mmai",
  cursor: -1
};

var options = {
  strategy: "retry",
  onEvent: function(eventName, data){
    if (eventName === "retrying"){
      console.log(data);
    }
  }
};

var callSettings = {
  endCondition: function(err, data){
    return (data.next_cursor_str == '0');
  },
  newParams: function(error, data, params){
    return {
      twitter_account: params.twitter_account,
      cursor: data.next_cursor_str
    };
  },
  aggregate: function(acc, res){
    return acc.concat(res.users);
  }
};

twitterProxy.callUntil(params, options, function(err, data){
    console.log("Total followers: " + data.length);
}, callSettings);
