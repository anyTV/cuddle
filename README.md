# Cuddle

[![Build Status](https://travis-ci.org/ravenjohn/cuddle.svg?branch=master)](https://travis-ci.org/ravenjohn/cuddle)

Cuddle is a minimal, chainable, retryable and "readability first" node http client. It's built to use for calling third-party APIs. Just what you need.

```sh
npm i cuddle@latest -S
```

## Use Cases

### Important notes
- Status code < 200 or >= 300 will be classifed as an error.
- Request will not fire unless `.then` or `.end` is called



### Simple
```js
const cudl = require('cuddle');

cudl.post
    .to('http://localhost:8082/api/user/1')
    .set_header('Authorization', 'Token sampletoken')
    .send({
        username: 'rvnjl',
        sex: 'male'
    })
    .then((err, result) => {

        if (err) {
            //handle error
        }

        console.log(result);
    });
```


### Promise:
```js
const cudl = require('cuddle');

cudl.post
    .to('http://localhost:8082/api/user/1')
    .set_header('Authorization', 'Token sampletoken')
    .send({
        username: 'rvnjl',
        sex: 'male'
    })
    .promise()
    .then(success)
    .catch(fail);
```


### Using with generators:
```js
const cudl = require('cuddle');
const co = require('co');

function* foo () {
    let user = yield cudl.get
        .to('http://localhost:8082/api/user/1')
        .set_header('Authorization', 'Token sampletoken')
        .promise();

    console.log(user);
}

co(foo);
```

### Throttling requests
```js
// will only let 50 concurrent requests
cudl.throttle(50);
```


### Easy scoping through args:
```js
const cudl = require('cuddle');

function foo () {
    const users = [
        {id: 1, name: 'jeff'},
        {id: 2, name: 'jenny'},
        {id: 3, name: 'julius'}
    ];

    users.forEach(user => {
        cudl.get
            .to('http://localhost:8082/api/user/' + user.id)
            .args(user)
            //.max_retry(10)    // default is 3
            //.debug()          // if you want to log all
            //.logger(winston)  // if you want to replace the logger (console)
            .then(bar);
    });
}

function bar (err, result, request, [user]) {

    if (err) {
        // cuddle will return a different error after reaching maximum retries
        if (err.code >= 500) {
            return request.retry();
        }

        console.error('Error with user ' + user.id + request);
        return;
    }

    user.more_info = result;

    // ...
}

foo();
```

