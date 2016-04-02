'use strict';


const cudl = require(__dirname + '/index');
const co = require('co');
/*

cudl.get
	.to('https://api.dailymotion.com/user/freedom/children')
	.log_level('debug')
	.send()
	.then((err, result, request) => {
		console.log('----------');
		console.log(err, result);
		console.log(request + '');
	});
*/

function* generator () {
	let api_result = yield cudl.get
		.to('https://api.dailymotion.com/user/freedom/children')
		.send()
		.promise();

	if (api_result instanceof Error) {
		return console.log('WTF!', api_result);
	}

	console.log(api_result);
}

co(generator);
