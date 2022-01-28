var mongoose = require("mongoose");

//SCHEMA SETUP
var productSchema = new mongoose.Schema({
	name: String,
	price: Number,
	image: String,
	description: String,
	display: Boolean,
	category: String,
	subCategory: String,
	measurement: String
});

module.exports = mongoose.model("Product", productSchema);