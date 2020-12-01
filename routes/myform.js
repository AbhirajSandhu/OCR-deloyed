const express = require('express');
const router = express.Router();
const Form = require('../models/form');
const middleware = require("../middleware");

//View All Forms
router.get('/view', middleware.isLoggedIn, function(req, res){
	Form.find(function(err, alldata){
		  if(err){
			  console.log(err);
		  }else{
			  const admin = "admin"
			  res.render("allforms", { forms : alldata , currentUser: req.user, admin});
		  }
	  })
  });

//View Form
// router.post("/:id", middleware.isLoggedIn, function(req, res){
// 	Form.findById(req.params.id).exec(function(err,foundData){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			res.render("myform", {data : foundData, currentUser: req.user});
// 		}
// 		req.flash('success', 'Successfull');
// 	})
// })

router.get("/:id", middleware.isLoggedIn, function(req, res){
	Form.findById(req.params.id).exec(function(err,foundData){
		if(err){
			console.log(err);
		}else{
			res.render("myform", {data : foundData, currentUser: req.user});
		}
	})
})

//EDIT FORM ROUTE
router.get("/:id/edit", function(req, res){
		//findById tells info of clicked form and help in edits
		Form.findById(req.params.id, function(err, founddata){
			res.render("edit", {data : founddata, currentUser: req.user});
		})
});

//UPDATE FORM ROUTE
// router.put("/:id", middleware.checkFormOwnership, function(req, res){
	
// 	Form.findByIdAndUpdate(req.params.id, {name : req.body.name,rollno:req.body.rollno,dept:req.body.dept}, function(err, UpdatedForm){
// 		if(err){
// 			res.send("Something went wrong...")
// 		} else{
// 			res.redirect("/myform/" + req.params.id + "/edit")
// 			//instead of re.params.id UpdatedForm.id can be used
// 		}
// 	})
// 	//redirect somewhere
// })
router.put("/:id", function(req, res){
	// rather than doing var data = { name = req.body.name, 
	//nest all together in array in edit.ejs using name=data[name]
	// here down then u have to use data instead req.body.name
	//find and update correct data
	Form.findByIdAndUpdate(req.params.id, req.body.data, function(err, UpdatedForm){
		if(err){
			res.redirect("/home");
			req.flash('error', 'Not Updated Please Try Again!')
		} else{
			req.flash('error', 'Not Updated Please Try Again!')
			res.redirect("/myform/view");
			//instead of re.params.id UpdatedForm.id can be used
		}
	})
	//redirect somewhere
})

//DESTROY Form
router.delete("/:id", function(req, res){
	Form.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.render("index", {currentUser: req.user})
		} else{
			res.render("index", {currentUser: req.user})
		}
	})
})

module.exports = router;