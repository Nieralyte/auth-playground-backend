import _ from 'lodash-fp'
import R from 'ramda'
import $ from 'D:/docs/projects/libs/nieralyte-utils/dist-node'

import breezeSequelize from 'breeze-sequelize'
import {Router} from 'express'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import models from './models'


const router = Router()

export default router


const breeze = breezeSequelize.breeze
const SequelizeQuery = breezeSequelize.SequelizeQuery
const SequelizeSaveHandler = breezeSequelize.SequelizeSaveHandler
const EntityQuery = breeze.EntityQuery


const TOKEN_SECRET = 'my-secret' // dev

function inspectReq(req) {
  $.log('\n\n\n----------- req -----------\n')
  
  var stuffToPick = [
    'body',
    'cookies',
    'headers',
    'method',
    'originalUrl',
    'params',
    'path',
    'query',
    'secret',
    'secure',
    'signedCookies',
    'url',
  ]
  
  
  //$(_.toPlainObject, $.inspect.colors(0), $.log)(req)
  $(_.pick(stuffToPick), $.inspect.colors(5), $.log)(req)
  
  $.log('\n===========================\n\n\n')
}


router.post('/signup', function(req, res) {
  inspectReq(req)
  
  
  models.users.create({
    username: req.body.username,
    verifier: bcrypt.hashSync(req.body.password, 10)
  })
    .then(function(user) {
      res
        .cookie(
          'token',
          jwt.sign({username: user.username}, TOKEN_SECRET)
        )
        
        .send('signed up & logged in')
    })
    
    .catch(function() {
      res.send('sorry, an error occurred')
    })
})


router.post('/login', function(req, res) {
  inspectReq(req)
  
  
  models.users.findOne({
    where: {username: req.body.username},
  })
    .then(function(user) {
      if (bcrypt.compareSync(req.body.password, user.verifier)) {
        res
          .cookie(
            'token',
            jwt.sign({username: user.username}, TOKEN_SECRET)
          )
          
          .send('logged in')
      } else {
        res.send('wrong credentials')
      }
    })
    
    .catch(function() {
      res.send('wrong credentials')
    })
})



//router.post('/logout', function(req, res) {
//  inspectReq(req)
//  
//  res
//    .clearCookie('token')
//    .send('logged out')
//})



// test authorization with vanilla sequelize:

router.get('/test/users/:username', function(req, res) {
  inspectReq(req)
  
  
  if (req.cookies.token) {
    g.token = req.cookies.token // debug
    
    jwt.verify(req.cookies.token, TOKEN_SECRET, function(err, payload) {
      if (req.params.username === payload.username) {
        models.users.findOne({
          where: {username: payload.username},
        })
          .then(function(user) {
            res.send('welcome, ' + user.username)
          })
          
          .catch(function() {
            res.send('sorry, an error occurred. try to re-log-in, maybe')
          })
      } else {
        res.send('please log in')
      }
    })
  } else {
    res.send('please log in')
  }
})





router.post('/sync', function(req, res) {
  return models.sync().then(function() {
    return res.send('synced')
  })
})


router.post('/drop', function(req, res) {
  return models.drop().then(function() {
    return res.send('dropped; don\'t forget to "POST /api/sync" afterwards')
  })
})



router.get('/Metadata', function(req, res) {
  return res.send(models.metadata)
})



router.get('/:resource', function(req, res) {
  let query = EntityQuery
    .fromUrl(req.url, req.params.resource)
  
  let sequelizeQuery = new SequelizeQuery(
    models.sequelizeManager,
    query
  )
  
  return sequelizeQuery.execute().then(function(result) {
    return res.send(result)
  })
})



router.post('/SaveChanges', function(req, res) {
  let saveHandler = new SequelizeSaveHandler(
    models.sequelizeManager,
    req
  )
  
  return saveHandler.save().then(function(results) {
    return res.send(results)
  })
})





//router.all('*', function(req, res) {
//  inspectReq(req)
//  
//  res.send('blah')
//})








