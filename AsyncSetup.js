'use strict'

/**
 * Dependencies
 */
const r = require('rethinkdb')

/**
 * Module Dependencies
 */
const DatabaseConnector = require('./db')

/**
 * AsyncSetup
 */
class AsyncSetup {

  constructor () {
    this.databases = []
    this.tables = []
    this.indices = []
  }

  registerDatabase(db) {
    this.databases.push({db})
  }

  registerTable(db, table) {
    this.tables.push({db, table})
  }

  registerIndex(db, table, index) {
    this.indices.push({db, table, index})
  }

  registerIndices(db, table, indices) {
    indices.forEach(index => {
      this.registerIndex(db, table, index)
    })
  }

  static ensureDatabase (db) {
    return new Promise((resolve, reject) => {
      let _conn

      DatabaseConnector.connection()
      .then(conn => {
        _conn = conn
        return r.dbList().run(_conn)
      })
      .then(list => {
        if (list.includes(db)) {
          return true
        } else {
          return r.dbCreate(db).run(_conn)
        }
      })
      .then(() => {
        return _conn.close()
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  static ensureTable (db, table) {
    return new Promise((resolve, reject) => {
      let _conn

      DatabaseConnector.connection()
      .then(conn => {
        _conn = conn
        return r.db(db).tableList().run(_conn)
      })
      .then(list => {
        if (list.includes(table)) {
          return true
        } else {
          return r.db(db).tableCreate(table).run(_conn)
        }
      })
      .then(() => {
        return _conn.close()
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  static ensureIndex (db, table, index) {
    return new Promise((resolve, reject) => {
      let _conn

      DatabaseConnector.connection()
      .then(conn => {
        _conn = conn
        return r.db(db).table(table).indexList().run(_conn)
      })
      .then(list => {
        if (list.includes(index)) {
          return true
        } else {
          return r.db(db).table(table).indexCreate(index).run(_conn)
        }
      })
      .then(() => {
        return _conn.close()
      })
      .then(() => {
        return resolve()
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  static ensureDatabases (dbs) {
    let database_promises = []
    dbs.forEach(({db}) => {
      database_promises.push(this.ensureDatabase(db))
    })
    return database_promises
  }

  static ensureTables (tables) {
    let table_promises = []
    tables.forEach(({db, table}) => {
      table_promises.push(this.ensureTable(db, table))
    })
    return table_promises
  }

  static ensureIndices (indices) {
    let index_promises = []
    indices.forEach(({db, table, index}) => {
      index_promises.push(this.ensureIndex(db, table, index))
    })
    return index_promises
  }

  resolve () {
    return Promise.all(AsyncSetup.ensureDatabases(this.databases))
      .then(() => {
        return Promise.all(AsyncSetup.ensureTables(this.tables))
      })
      .then(() => {
        return Promise.all(AsyncSetup.ensureIndices(this.indices))
      })
  }

}

/**
 * Export
 */
module.exports = new AsyncSetup()
