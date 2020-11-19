//all the middlewares go here
var middlewareObj = {},
    Form          = require('../models/form');

middlewareObj.checkFormOwnership = function(req, res, next){
	//is user logged in
	if(req.isAuthenticated()){
		//findById tells info of clicked form and help in edits
		Form.findById(req.params.id, function(err, foundForm){
			if(err){
				req.flash("error", "Campground Not Found!");
				res.redirect("back");
			} else{
				//does user own the form?
				if(foundForm.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "Permission Denied!");
					res.redirect("back");
				}
			}
		})
	}	else{
		req.flash("error", "You are not logged in!");
		res.redirect("back")
	}
} 

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} 
	req.flash("error", "You are not logged in!");
	res.redirect("/login");
};


module.exports = middlewareObj;