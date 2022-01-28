var express = require("express"),
	app = express(),
 	bodyParser = require("body-parser"),
 	mongoose = require("mongoose"),
 	flash = require("connect-flash"),
 	moment = require('moment'),
 	passport = require("passport"),
 	LocalStrategy = require("passport-local"),
 	methodOverride = require("method-override"),
 	seedDB = require("./seeds"),
 	User = require("./models/user"),
 	cookieParser = require("cookie-parser"),
	sessions = require('express-session');

app.locals.moment = moment;

var productRoutes = require("./routes/products");
var userRoutes = require("./routes/users");

mongoose.connect('mongodb://localhost:27017/final_project', {useNewUrlParser: true, useUnifiedTopology: true});

seedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

const oneDay = 1000 * 60 * 60 * 24;
app.use(require("express-session")({
	secret: "bdioabwqyebd08bexuwdb2135245255",
	saveUninitialized: true,
	cookie: { maxAge: oneDay},
	resave: false
}));

app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(productRoutes);
app.use(userRoutes);

app.listen(process.env.PORT || 3000, function(){
	console.log("The YelpCamp Server Has Started!");
});