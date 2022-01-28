var mongoose = require("mongoose");

var OrderSchema = new mongoose.Schema({
	customer: String,
	houseNumber: String,
	area: String,
	city: String,
	state: String,
	country: String,
	phoneNumber: String,
	createdAt: { type: Date , default: Date.now },
	total: Number,
	order: [
		{
			product: String,
			price: Number,
			quantity: Number
		}
	]
});

module.exports = mongoose.model("Order", OrderSchema);