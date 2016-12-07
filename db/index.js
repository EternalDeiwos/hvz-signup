'use strict'

/**
 * Dependencies
 */
const r = require('rethinkdb')

/**
 * Module Dependencies
 */
const Config = require('../config')

/**
 * Database Connector
 *
 * @class
 * Database helper class for Express middlewares
 */
class DatabaseConnector {

  static connect (req, res, next) {
    DatabaseConnector.connection()
      .then(conn => {
        req.dbConn = conn
        return next()
      })
      .catch(err => {
        console.error('Error creating DB Connection:', err.message, err.stack)
      })
  }

  static close (req, res, next) {
    req.dbConn.close()
      .then(() => {
        return next()
      })
      .catch(err => {
        console.error('Error closing DB Connection:', err.message, err.stack)
      })
  }

  static connection () {
    return r.connect(Config.rethinkdb)
  }

}

/**
 * Export
 */
module.exports = DatabaseConnector
