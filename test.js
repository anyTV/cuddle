var cuddle = require('./index')();

cuddle.get
	.to('localhost')
	.then(function (err, result, headers) {
		console.log(err, result, headers);
	});

cuddle.get
	.to('http://localhost')
	.then(function (err, result, headers) {
		console.log(err, result, headers);
	});

cuddle.get
	.to('https://localhost')
	.then(function (err, result, headers) {
		console.log(err, result, headers);
	});

cuddle.get
	.to('http://localhost/hello')
	.then(function (err, result, headers) {
		console.log(err, result, headers);
	});

cuddle.post
	.to('http://localhost/hello?hi=23&asf=23')
	.send({message : 1})
	.then(function (err, result, headers) {
		console.log(err, result, headers);
	});
