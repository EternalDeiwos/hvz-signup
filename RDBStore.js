'use strict'

/**
 * Dependencies
 */
const r = require('rethinkdbdash')
const session = require('express-session')
const RDBStore = require('session-rethinkdb')(session)

/**
 * Module Dependencies
 */
const Config = require('./config')

/**
 * RethinkDB Dash Database Connector
 */
const conn = r({
  servers: [
    Config.rethinkdb
  ]
})

/**
 * RethinkDB Session Store
 */
const store = new RDBStore(conn, {
  browserSessionsMaxAge: 3600000,
  table: 'session'
})

/**
 * Export
 */
module.exports = store
