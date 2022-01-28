var CartItem = require("../models/cartItem");

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect("/login");
}

middlewareObj.checkCartItemOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		CartItem.findOne({_id: req.params.cartItem_id}, function(err, foundCartItem){
			if(err || !foundCartItem){
				req.flash("error", "Comment not found!");
				res.redirect("back");
			} else {
				console.log(foundCartItem);
				if(foundCartItem.owner.equals(req.user._id)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("back");
				}
			}
		});	
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("back");
	}
}

module.exports = middlewareObj;