require("./config/config")

const express = require('express')
  , path = require('path')
  , logger = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , db = require("./db/mongoose")
  , cors = require("cors")

db.connect()

const index = require('./routes/index');
const users = require('./routes/users');

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', "*");
//   res.header('Access-Control-Allow-Methods','GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, x-auth');
//   res.header('Access-Control-Expose-Headers', 'x-auth');
//   next();
// })

app.use('/', index);
app.use('/users', users);

const port = process.env.PORT

app.listen(port, () => {
  console.log("Listening... on port " + port)
})