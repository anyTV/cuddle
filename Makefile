mocha_option := --compilers js:babel-core/register --recursive -t 5000 -s 100
test:
	@NODE_ENV=test ./node_modules/.bin/mocha -R spec $(mocha_option)

.PHONY: test