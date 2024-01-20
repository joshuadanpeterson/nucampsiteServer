// app.js

var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
var logger = require("morgan");
// Set up express-session
const session = require('express-session');
const FileStore = require('session-file-store')(session);
// Import passport for authentication
const passport = require('passport');
// const authenticate = require('./authenticate');
const config = require('./config');

// Import routers
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");
const uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');

// Create Mongoose server
const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

// Import passport
app.use(passport.initialize());
app.use(passport.session());

// Serve Static Files Before Authentication
app.use(express.static(path.join(__dirname, "public")));

// Route Definitions
app.use("/", indexRouter);
// Routes that don't require authentication
app.use("/users", usersRouter);

// Set up user authentication support
function auth(req, res, next) {
    console.log(req.user);

    if (!req.user) {
        const err = new Error('You are not authenticated!');                    
        err.status = 401;
        return next(err);
    } else {
        return next();
    }
}

app.use(auth);

// Set up Nucamp routers
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);

// Set up Campsites router test
app.get("/campsites/test", (req, res) => {
  res.send("Campsites route is working");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

// Secure traffic only
app.all('*', (req, res, next) => {
    if (req.secure) {
      return next();
    } else {
        console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
        res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
    }
});

module.exports = app;
