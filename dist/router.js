'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodashFp = require('lodash-fp');

var _lodashFp2 = _interopRequireDefault(_lodashFp);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _distNode = require('D:/docs/projects/libs/nieralyte-utils/dist-node');

var _distNode2 = _interopRequireDefault(_distNode);

var _breezeSequelize = require('breeze-sequelize');

var _breezeSequelize2 = _interopRequireDefault(_breezeSequelize);

var _express = require('express');

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _models = require('./models');

var _models2 = _interopRequireDefault(_models);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();

exports.default = router;

var breeze = _breezeSequelize2.default.breeze;
var SequelizeQuery = _breezeSequelize2.default.SequelizeQuery;
var SequelizeSaveHandler = _breezeSequelize2.default.SequelizeSaveHandler;
var EntityQuery = breeze.EntityQuery;

var TOKEN_SECRET = 'my-secret'; // dev

function inspectReq(req) {
  _distNode2.default.log('\n\n\n----------- req -----------\n');

  var stuffToPick = ['body', 'cookies', 'headers', 'method', 'originalUrl', 'params', 'path', 'query', 'secret', 'secure', 'signedCookies', 'url'];

  //$(_.toPlainObject, $.inspect.colors(0), $.log)(req)
  (0, _distNode2.default)(_lodashFp2.default.pick(stuffToPick), _distNode2.default.inspect.colors(5), _distNode2.default.log)(req);

  _distNode2.default.log('\n===========================\n\n\n');
}

router.post('/signup', function (req, res) {
  inspectReq(req);

  _models2.default.users.create({
    username: req.body.username,
    verifier: _bcrypt2.default.hashSync(req.body.password, 10)
  }).then(function (user) {
    res.cookie('token', _jsonwebtoken2.default.sign({ username: user.username }, TOKEN_SECRET)).send('signed up & logged in');
  }).catch(function () {
    res.send('sorry, an error occurred');
  });
});

router.post('/login', function (req, res) {
  inspectReq(req);

  _models2.default.users.findOne({
    where: { username: req.body.username }
  }).then(function (user) {
    if (_bcrypt2.default.compareSync(req.body.password, user.verifier)) {
      res.cookie('token', _jsonwebtoken2.default.sign({ username: user.username }, TOKEN_SECRET)).send('logged in');
    } else {
      res.send('wrong credentials');
    }
  }).catch(function () {
    res.send('wrong credentials');
  });
});

//router.post('/logout', function(req, res) {
//  inspectReq(req)
// 
//  res
//    .clearCookie('token')
//    .send('logged out')
//})

// test authorization with vanilla sequelize:

router.get('/test/users/:username', function (req, res) {
  inspectReq(req);

  if (req.cookies.token) {
    g.token = req.cookies.token; // debug

    _jsonwebtoken2.default.verify(req.cookies.token, TOKEN_SECRET, function (err, payload) {
      if (req.params.username === payload.username) {
        _models2.default.users.findOne({
          where: { username: payload.username }
        }).then(function (user) {
          res.send('welcome, ' + user.username);
        }).catch(function () {
          res.send('sorry, an error occurred. try to re-log-in, maybe');
        });
      } else {
        res.send('please log in');
      }
    });
  } else {
    res.send('please log in');
  }
});

router.post('/sync', function (req, res) {
  return _models2.default.sync().then(function () {
    return res.send('synced');
  });
});

router.post('/drop', function (req, res) {
  return _models2.default.drop().then(function () {
    return res.send('dropped; don\'t forget to "POST /api/sync" afterwards');
  });
});

router.get('/Metadata', function (req, res) {
  return res.send(_models2.default.metadata);
});

router.get('/:resource', function (req, res) {
  var query = EntityQuery.fromUrl(req.url, req.params.resource);

  var sequelizeQuery = new SequelizeQuery(_models2.default.sequelizeManager, query);

  return sequelizeQuery.execute().then(function (result) {
    return res.send(result);
  });
});

router.post('/SaveChanges', function (req, res) {
  var saveHandler = new SequelizeSaveHandler(_models2.default.sequelizeManager, req);

  return saveHandler.save().then(function (results) {
    return res.send(results);
  });
});

//router.all('*', function(req, res) {
//  inspectReq(req)
// 
//  res.send('blah')
//})