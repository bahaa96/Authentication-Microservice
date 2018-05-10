const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const _ = require("lodash")
const bcrypt = require("bcryptjs")
const { ObjectId } = require("mongoose").Schema


const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
    validate: {
      validator: (v) => {
        return validator.isEmail(v)
      },
      message: "You should enter a valid Email."
    }
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  tokens: [
    {
      access: {
        type: String,
        required: true,
      },
      token: {
        type: String,
        required: true,
      }
    }
  ]
})

UserSchema.methods.generateAuthToken = function() {
  const data = {
    _id: this._id.toHexString()
  }
  const access = "auth"
  const token = jwt.sign(data, process.env.JWT_SECRET)
  this.tokens.push({
    access,
    token: token
  })
  return this.save()
    .then(() => {
      return token
    }).catch(e => e)
}

UserSchema.methods.removeToken = function (token) {
  const user = this
  return user.update({
    $pull: {
      tokens: {token}
    }
  })
}

UserSchema.methods.toJSON = function () {
  const user = this.toObject()
  return _.pick(user, ['_id', 'username', "email", "messages"])
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  }catch (e) {
    return Promise.reject("Invalid token")
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': "auth"
  })
}

UserSchema.statics.findByCredentials = function (username, password) {
  return User.findOne({username})
    .then(user => {
      if(!user) return Promise.reject("Invalid username")
      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if(res) resolve(user)
          else reject({ message: "Invalid password"})
        })
      })
    })
}

UserSchema.pre("save", function (next) {
  const user = this
  if(user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      if(err) throw new Error(err)
      bcrypt.hash(user.password, salt, (err, hash) => {
        if(err) throw new Error(err)
        user.password = hash
        next()
      })
    })
  }else {
    next()
  }
})

const User = mongoose.model("User", UserSchema)


module.exports = User