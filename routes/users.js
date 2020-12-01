var express  = require("express");
var router   = express.Router();
var passport = require("passport");
var User	 = require("../models/user");

router.get("/",function(req, res){
	res.render("landing");
})


// Auth Routes */*/*/*/*/
//Show sign up form
router.get("/register", function(req,res){
	res.render("users/register");
})
//***********************************
//Handling user sign up
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser , req.body.password, function(err, user){
		if(err){
			// req.flash("error",err.message);
			return res.render('users/alterregister',{err : err});
		} else{
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Welcome " + user.username);
				res.redirect("/home");
			})
		}
	})
})
//login form
router.get("/login", function(req, res){
	res.render("users/login");
})
//login logic
// app.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", {
	successRedirect: "/home",
	failureRedirect: "/login",
	failureFlash: 'Invalid username or password.',
	successFlash: "Logged In"

}) , function(req, res){
	
})
//logout
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged Out");
	res.redirect("/home");
})

// //Function middleware

// function isLoggedIn(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	} 
// 	res.redirect("/login");
// };

module.exports = router;