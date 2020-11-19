// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;
// const passportLocalMongoose = require('passport-local-mongoose');

// const UserSchema = new Schema({
//     email: {
//         type: String,
//         required: true,
//         unique: true
//     }
// });

// UserSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model('User', UserSchema);
var mongoose = require("mongoose"),
	passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String 
})

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);