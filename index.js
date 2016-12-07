'use strict'

/**
 * Dependencies
 */
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const session = require('express-session')
const sessionStore = require('./RDBStore')
const r = require('rethinkdb')

/**
 * Module Dependencies
 */
const DatabaseConnector = require('./db')
const UserTable = require('./db/User')
const Config = require('./config')
const SetupHelper = require('./AsyncSetup')

/**
 * Express App
 */
const app = express()

/**
 * Setup
 */
app.use(compression())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(session({
  secret: Config.secrets.session,
  cookie: {
    maxAge: 10000 // 10000 (10 secs) for testing, 3600000 (1 hour) for production.
  },
  store: sessionStore,
  resave: true,
  saveUninitialized: true
}))

SetupHelper.registerDatabase(Config.rethinkdb.db)
SetupHelper.registerTable(Config.rethinkdb.db, UserTable.tableName)
SetupHelper.registerIndices(Config.rethinkdb.db, UserTable.tableName, UserTable.indices)

/**
 * Database Connection
 */
app.use(DatabaseConnector.connect)

/**
 * Routes
 */
app.get('/', function (req, res, next) {
  let n = req.session.views || 0
  req.session.views = ++n

  res.status(200).json({ something: 'Hello World!', views: n })
})

/**
 * Destroy Database Connection
 */
app.use(DatabaseConnector.close)

/**
 * Listen
 */
SetupHelper.resolve()
  .then(() => {
    app.listen(3000)
    console.log('Listening on port 3000')
  })
  .catch(err => {
    console.error('Failed to start app:', err.stack)
    process.exit(1)
  })
