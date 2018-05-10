const router = require("express").Router()
const _ = require("lodash")
const User = require("../models/User")

router.post("/new", (req, res) => {
  const user = _.pick(req.body, "username", "password", "email")
  const newUser = new User(user)
  newUser.save().then(() => {
    res.json(JSON.stringify(user))
  }).catch(e => {
    res.json(JSON.stringify(e))
  })
})

router.post("/login", (req, res) => {
  const {username, password} = req.body
  User.findByCredentials(username, password)
    .then(user => {
      user.generateAuthToken()
        .then(token => {
          res.header("X-auth", token).json(user.toJSON())
        })
    })
    .catch(e => {
      res.end(JSON.stringify(e))
    })
})

router.post("/logout", (req, res) => {
  const token = req.header("X-auth")
  User.findByToken(token)
    .then(user => {
      user.removeToken(token).then(() => {
        res.end()
      })
    })
})

module.exports = router