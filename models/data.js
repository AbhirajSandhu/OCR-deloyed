var mongoose = require("mongoose");

var dataSchema = new mongoose.Schema({
	text: String
})

module.exports = mongoose.model("Data", dataSchema);

// var dataSchema = new mongoose.Schema({
// 	text: String
// })

// var Data = mongoose.model("Data", dataSchema);