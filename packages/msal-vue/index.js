'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/msal-vue.min.cjs')
} else {
  module.exports = require('./dist/msal-vue.cjs')
}
