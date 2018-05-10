const mongoose = require("mongoose")

module.exports = {
  connect: () => {
    mongoose.Promise = global.Promise
    mongoose.connect(process.env.MONGODB_URI).then(connection => {
      console.log('Connected to MongoDB')
    })
    .catch(error => {
      console.log(error.message)
    })
  }
}