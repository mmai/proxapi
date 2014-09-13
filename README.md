_Proxapi_ is a javascript library acting as a proxy between your code and APIs of services like Twitter, Google or Facebook which limit the number of requests allowed in a period of time. With it, you can set up various strategies to deal with theses limits such as sending back an informative error message or waiting for the end of the limited period to retry the request.

Installation
------------

In the browser, include the file [dist/proxapi-0.3.1.min.js](https://github.com/mmai/proxapi/raw/master/dist/proxapi-0.3.1.min.js)
```html
<script src="proxapi-0.3.1.min.js"></script>
<script type="text/javascript">
  var proxApi = new ProxAPI(settings);
</script>
```

In node, install the npm package with `npm install proxapi`, then : 
```
var ProxAPI = require("proxapi");
var proxApi = new ProxAPI(settings);
```

Usage
-----

There is an introductory tutorial [here](tutorial.md).
Check the [generated documentation](http://mmai.github.io/proxapi/ProxAPI.html) for a complete reference of ProxAPI settings options and methods.
Check as well the code source [examples/](examples/) folder.

