var mongoose = require("mongoose");

var formSchema = new mongoose.Schema({
	name: String,
	rollno: String,
	dept: String,
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
})

module.exports = mongoose.model("Form", formSchema);

// var formSchema = new mongoose.Schema({
// 	name: String,
// 	rollno: String,
// 	dept: String,
// 	user : String
// })

// var Form = mongoose.model("Form", formSchema);