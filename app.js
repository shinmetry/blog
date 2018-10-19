'use strict';
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');
var multer = require('multer');

//モデルの読み込み
var User = require('./models/user');
var Diary = require('./models/diary');
User.sync().then(() => {
  Diary.belongsTo(User, {foreignKey: 'createdBy'});
  Diary.sync();
});



var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_API_CLIENT_ID,
  clientSecret: process.env.GOOGLE_API_CLIENT_SECRET,
  // callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/google/callback' : "http://localhost:8000/auth/google/callback"
  callbackURL: 'http://localhost:8000/auth/google/callback'
}, function (accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    User.upsert({
      userId: profile.id,
      username: profile.displayName
    }).then(() => {
      done(null, profile);
    });
  });
}
));

var index = require('./routes/index');
var posts = require('./routes/posts');
var login = require('./routes/login');
var logout = require('./routes/logout');

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.GOOGLE_API_CLIENT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/', index);
app.use('/posts', posts);
app.use('/login', login);
app.use('/logout', logout);


app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['email', 'profile']
  }),
  function (req, res) {});

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login'
  }),
  function (req, res) {
   var loginFrom = req.cookies.loginFrom;
    if (loginFrom &&
    loginFrom.indexOf('http://') < 0 &&
    loginFrom.indexOf('https://') < 0) {
     res.clearCookie('loginFrom');
     res.redirect(loginFrom);
    } else {
    res.redirect('/');
  }
  });


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

module.exports = app;
