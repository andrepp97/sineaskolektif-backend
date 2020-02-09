  const jwt = require('jsonwebtoken')


  module.exports = {
      createJWTToken: (payload) => {
          return jwt.sign(payload, 'sineas', {
              expiresIn: '24h'
          })
      }
  }