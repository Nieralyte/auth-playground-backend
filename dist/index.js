'use strict';

var _n_ = require('n_');

var _n_2 = _interopRequireDefault(_n_);

var _patchRepl = require('D:/docs/projects/patches/_vendor/_node/patch-repl');

var _patchRepl2 = _interopRequireDefault(_patchRepl);

var _lodashFp = require('lodash-fp');

var _lodashFp2 = _interopRequireDefault(_lodashFp);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _distNode = require('D:/docs/projects/libs/nieralyte-utils/dist-node');

var _distNode2 = _interopRequireDefault(_distNode);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _serveIndex = require('serve-index');

var _serveIndex2 = _interopRequireDefault(_serveIndex);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _patchRepl2.default)(_n_2.default, __filename); //setTimeout(function() {
//
//debugger

Object.defineProperty(_lodashFp2.default.prototype, 'v', { get: _lodashFp2.default.prototype.value });

global.g = global;
//const g = {}

g.require = require;
g._ = _lodashFp2.default;
g.R = _ramda2.default;
g.$ = _distNode2.default;

console.log('ololo');

var app = (0, _express2.default)();

app.use((0, _morgan2.default)('dev'));
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use(_bodyParser2.default.json());
app.use((0, _cookieParser2.default)());

app.use('/api', _router2.default);

// placed at the bottom so they don't intercept /api/* calls:

app.use('/', (0, _serveStatic2.default)('D:/docs/projects'));
app.use('/', (0, _serveIndex2.default)('D:/docs/projects'));

_models2.default.sync().then(function () {
  g.server = app.listen(80);
});

//}, 0)