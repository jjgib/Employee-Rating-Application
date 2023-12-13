require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var empRouter = require('./routes/employee');
var ratingRouter = require('./routes/ratings');

var hbs = require('express-handlebars');
var Handlebars = require("handlebars");
var db = require('./config/connection'); //DB
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var session = require('express-session');
var expiryDate = new Date(Date.now() + 60 * 60 * 1000); //600000
var one_day = 24 * 60 * 60 * 1000;

var app = express();
app.use(cors());
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',
runtimeOptions: { allowProtoPropertiesByDefault: true, allowProtoMethodsByDefault: true }
}));
Handlebars.registerHelper('checked', function(value, test) {
  if (value == undefined) return '';
  return value==test ? 'checked' : '';
});

//app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);
app.use(session({
    secret:"thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie:{ maxAge: one_day },
    resave:false
  }));
  /*resave:true, 
    saveUninitialized:true*/

/*db.connect((err)=>{
  if(err) console.log("Connection Error"+err);
  else console.log("Database connected to port 27017");
})*/
//Connecting to the database using Mongoose
mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true
}).then(() => {
  console.log("Successfully connected to the database");    
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err);
  process.exit();
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/users', usersRouter);
app.use('/employee', empRouter);
app.use('/rating', ratingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

app.use((req,res,next)=>{
  //res.locals.session = req.session;
  if(!req.session){
    return next(new Error('Oh no')); //handle error
  }
  next();
});

module.exports = app;


//"start": "node ./bin/www"