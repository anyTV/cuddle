'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Cuddle = function () {
    function Cuddle() {
        _classCallCheck(this, Cuddle);
    }

    _createClass(Cuddle, null, [{
        key: 'request',
        value: function request(method) {
            return new _request2.default(method);
        }
    }, {
        key: 'stringify',
        value: function stringify() {
            return _request2.default.stringify.apply(null, arguments);
        }
    }, {
        key: 'throttle',
        value: function throttle(n) {
            return _request2.default.throttle(n);
        }
    }, {
        key: 'get',
        get: function get() {
            return new _request2.default('GET');
        }
    }, {
        key: 'post',
        get: function get() {
            return new _request2.default('POST');
        }
    }, {
        key: 'put',
        get: function get() {
            return new _request2.default('PUT');
        }
    }, {
        key: 'delete',
        get: function get() {
            return new _request2.default('DELETE');
        }
    }]);

    return Cuddle;
}();

exports.default = Cuddle;
module.exports = exports['default'];