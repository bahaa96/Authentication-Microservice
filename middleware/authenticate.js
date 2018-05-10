const User = require("../models/User")

module.exports = (req, res, next) => {
  const token = req.header("x-auth")
  User.findByToken(token)
    .then(user => {
      req.user = user
      req.token = token
      next()
    }).catch(e => {
    res.status(401).send(e)
  })
}