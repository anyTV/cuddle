Cuddle
===

A very simple HTTP client for Node.js
<!-- language:console -->

	npm install cuddle

Sample
---
<!-- language:console -->

    var request = require('cuddle');

    request.get
          .to('www.restserver.com:3000/user/1')
          .then(callback);




Features
---

1. Chainable
2. Very readable
3. Helps closures by using `.args()`
4. Auto-retry for errors like `ECONNREFUSED`, `ENOTFOUND`, `ECONNRESET`,  `EADDRINFO`, `EMFILE`


Functions
---

Function/Property | Parameter | Return | Description
--- | --- | --- | ---
cuddle(logger) | logger e.g. `console`, `winston` | cuddle | Sets the logger
cuddle.stringify(object) | object | string | Converts `{a:1, b:2}` to `a=1&b=2`
cuddle.get | n/a | request object | Instantiates a `GET` request
cuddle.post | n/a | request object | Instantiates a `POST` request
cuddle.put | n/a | request object | Instantiates a `PUT` request
cuddle.delete | n/a | request object | Instantiates a `DELETE` request
cuddle.request('PATCH') | method | request object | Instantiates a request using the given method
request.to('host', port, 'path') | host  <br/> port <br/> path | itself | Sets the request uri
request.add_header('header', 'value') | header <br /> value | itself | adds header
request.args('arg1', [arg2], {arg3}, arg4) | any number of arguments | itself | Accepts any number of arguments and will be passed as the fourth paramater on callback as an [array]
request.set_before_json(fn) | function | itself | Accepts a function to execute before parsing the data to JSON
request.raw() | none | itself | Disable automatic JSON parsing, removes default `application/json` on `Accept` header
request.secured() | none | itself | Will use https, but be sure to pass 443 as the port
request.follow_redirects(5) | number | itself | Follow redirects up to passed max redirects, default is 3
request.send({data}) | data | itself | Sets the payload
request.set_max_retry(5) | number | itself | Sets the max retry, default is 3
request.retry() | none | itself | Retries the request
request.then(fn) | function | itself | Sets the callback then executes request. Callback arguments are `err` non-200 status codes will be considered as an error, `result` response data, `request` the request it self so you can call retry if you want and the request will have a `response_headers` property if you need it, lastly `args` if you used `.args`

