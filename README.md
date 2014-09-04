Facilitate access to quota limited APIs by acting as a proxy. Provides various strategies to handle limitations:
 * pause when quota has been reach until the end of limit period and return only when all results have been fetched
 * return the maximum results for the current period
 * return an error and the quota limitation
 * ...

Usage
=====

You must first construct a wrapper function around the api you want to use in order to be understood by the AQM proxy.
AQM add another layer wich permits severals operations.
In order to use it, you must conform to this new api by converting all your request to a common format :


Your code => AQM.call => call() => API => callback() => AQM.callback => your code

```javascript
{
  call: function(){};
  callback: function(){};
  strategy: {
    type:
  }
}
```

    this.twitter.get('users/lookup', {screen_name: twitter_account}, function (err, data, response){

