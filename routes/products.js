var express = require("express");
var router = express.Router();
var Product = require("../models/product");

router.get("/", function(req, res){
	if(req.query.search) {
		var noMatch = null;
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Product.find({name: regex}, function(err, allProducts){
			if(err){
				console.log(err);
			} else {
				if(allProducts.length < 1){
					var noMatch = "No products match that query, please try again.";
				}
				res.render("index", {products: allProducts, noMatch: noMatch, hide: true});
			}
		});
	} else {
		Product.find({}, function(err, allProducts){
			if(err){
				console.log(err);
			} else {
				res.render("index", {products: allProducts, noMatch: noMatch, hide: false});
			}
		});
	}
});

router.get("/product/:id", function(req, res){
	Product.findOne({_id: req.params.id}, function(err, product){
		if(err || !product){
			/*req.flash("error", "User not found!");*/
			res.redirect("back");
		} else {
			res.render("show", {product: product});
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
