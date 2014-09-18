[![Build Status](https://travis-ci.org/mmai/proxapi.svg?branch=master)](https://travis-ci.org/mmai/proxapi)

_Proxapi_ is a javascript library acting as a proxy between your code and APIs of services like Twitter, Google or Facebook which limit the number of requests allowed in a period of time. With it, you can set up various strategies to deal with theses limits such as sending back an informative error message or waiting for the end of the limited period to retry the request.

Installation
------------

In node, install the npm package with `npm install proxapi`, you can then initialize a ProxAPI instance with : 
```
var ProxAPI = require("proxapi");
var proxApi = new ProxAPI(settings);
```

In the browser, include the file [proxapi-0.4.1.min.js](http://mmai.github.io/proxapi/dist/proxapi-0.4.1.min.js)
```html
<script src="proxapi-0.4.1.min.js"></script>
<script type="text/javascript">
  var proxApi = new ProxAPI(settings);
</script>
```


Usage
-----

There is an introductory tutorial [here](http://github.com/mmai/proxapi/blob/master/tutorial.md).
Check the [generated documentation](http://mmai.github.io/proxapi/ProxAPI.html) for a complete reference of ProxAPI settings options and methods.
Check as well the source code [examples/](http://github.com/mmai/proxapi/tree/master/examples/) folder.

