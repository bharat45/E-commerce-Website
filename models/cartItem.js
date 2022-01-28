var mongoose = require("mongoose");

var CartItemSchema = new mongoose.Schema({
	quantity: Number,
	name: String,
	price: Number,
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	}	
});

module.exports = mongoose.model("CartItem", CartItemSchema);