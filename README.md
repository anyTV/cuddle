#Cuddle

[![Build Status](https://travis-ci.org/ravenjohn/cuddle.svg?branch=master)](https://travis-ci.org/ravenjohn/cuddle)

Cuddle is a minimal, chainable, retryable and "readability first" node http client. It's built to use for calling third-party APIs. Just what you need.

```sh
npm install cuddle --save
```

##Use Cases

###Simple
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


###Promise:
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


###Using with generators:
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

###Easy scoping through args:
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

function bar (err, result, request, args) {
    const user = args[0];

    if (err) {
        // cuddle will return a different error after reaching maximum retries
        if (err.status_code >= 500) {
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


Status code < 200 or >= 300 will be classifed as an error.


##Migrating from version <= 0.0.56
1. No longer support logger in class constructor
2. max_retry default to 0
3. then/end must be called to start the request
4. `add_header` is now `set_header`
