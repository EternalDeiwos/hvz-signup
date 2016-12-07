'use strict'

/**
 * Dependencies
 */
const _ = require('lodash')
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const cwd = process.cwd()

/**
 * Constants
 */
const configDir = 'config'
const configFile = 'config.json'
const configExampleFile = 'config.example.json'

/**
 * Config
 *
 * @description
 * Config default values and setup handler
 */
function Config () {
  let config, exampleConfig
  try {
    exampleConfig = require(path.join(cwd, configDir, configExampleFile))
  } catch (err) { }

  try {
    config = require(path.join(cwd, configDir, configFile))
  } catch (err) { }

  if (!config) {
    let newConfig = Object.assign({}, exampleConfig)
    newConfig.secrets.session = generateSessionSecret()

    fs.writeFileSync(path.join(cwd, configDir, configFile), JSON.stringify(newConfig, null, 2))
    console.error('No config detected. Default config generated at `./config/config.json\'. Please make changes where necessary and restart the process.')
    process.exit(0)
  } else {
    return _.assign({}, _.merge(exampleConfig, config))
  }
}

function generateSessionSecret () {
  const buf = crypto.randomBytes(32)
  return buf.toString('base64')
}

/**
 * Exports
 */
module.exports = Config()
