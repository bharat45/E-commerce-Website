var mongoose = require("mongoose");
var Product = require("./models/product");
var User = require("./models/user");
var CartItem = require("./models/cartItem");
var Order = require("./models/order");

var data = [
	{
		name:"Amul Full-Cream Milk",
		price: "29",
		quantity: "1",
		display: "true",
		category: "Milk Products",
		image:"https://5.imimg.com/data5/SELLER/Default/2021/1/IB/BJ/BY/118764700/amul-gold-p-500x500.jpg",
		description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	},
	{
		name:"Amul Tonned Milk",
		price: "25",
		quantity: "1",
		display: "true",
		category: "Milk Products",
		image:"https://tiimg.tistatic.com/fp/1/006/752/amul-toned-milk-pouch-057.jpg",
		description:"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
	}
];

function seedDB(){
	/*Product.deleteMany({}, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("removed products!");
			data.forEach(function(seed){
				Product.create(seed, function(err, product){
					if(err){
						console.log(err);
					} else {
						console.log("added Product");
					}
				});
			});
		}
	});*/
	User.deleteMany({}, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("removed all users!");
		}
	});
	CartItem.deleteMany({}, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("cart items removed.");
		}
	});
	Order.deleteMany({}, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("orders removed.");
		}
	});
}

module.exports = seedDB;