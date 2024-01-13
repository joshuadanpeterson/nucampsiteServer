// app.js

// Import routers
const campsiteRouter = require("./routes/campsiteRouter");
const promotionRouter = require("./routes/promotionRouter");
const partnerRouter = require("./routes/partnerRouter");

// Set up express-session
const session = require('express-session');
const FileStore = require('session-file-store')(session);

// Create Mongoose server
const mongoose = require('mongoose');
const url = 'mongodb://127.0.0.1:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express()

// Request test
app.use((req, res, next) => {
	console.log('Incoming request:', req.method, req.url);
	next();
});

// Test
app.get("/test", (req, res) => {
	res.send("Server is working");
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//app.use(sessionParser('12345-67890-09876-54321'));

app.use(session({
    name: 'session-id',
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
}));

// Route Definitions
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Set up user authentication support
function auth(req, res, next) {
    console.log(req.session);

    if (!req.session.user) {
        const err = new Error('You are not authenticated!');
        err.status = 401;
        return next(err);
    } else {
        if (req.session.user === 'authenticated') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);

// Set up Nucamp routers
app.use("/campsites", campsiteRouter);
app.use("/promotions", promotionRouter);
app.use("/partners", partnerRouter);

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

// Serve Static Files Before Authentication
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;
