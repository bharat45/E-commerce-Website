var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	houseNumber: String,
	area: String,
	city: String,
	country: String,
	state: String,
	name: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	phoneNumber: String,
	cart: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "CartItem"
		}
	],
	orders: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order"
		}
	] 
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);