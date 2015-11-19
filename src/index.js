//setTimeout(function() {
//
//debugger

import repl from 'n_'
import patchRepl from 'D:/docs/projects/patches/_vendor/_node/patch-repl'

import _ from 'lodash-fp'
import R from 'ramda'
import $ from 'D:/docs/projects/libs/nieralyte-utils/dist-node'

import express from 'express'
import morgan from 'morgan'
import serveStatic from 'serve-static'
import serveIndex from 'serve-index'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import models from './models'
import router from './router'

patchRepl(repl, __filename)
Object.defineProperty(_.prototype, 'v', {get: _.prototype.value})

global.g = global
//const g = {}

g.require = require
g._ = _
g.R = R
g.$ = $


console.log('ololo')


const app = express()


app.use(morgan('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/api', router)


// placed at the bottom so they don't intercept /api/* calls:

app.use('/', serveStatic('D:/docs/projects'))
app.use('/', serveIndex('D:/docs/projects'))




models.sync().then(function() {
  g.server = app.listen(80)
})



//}, 0)

