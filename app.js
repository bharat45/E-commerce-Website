var express = require("express"),
	app = express(),
 	bodyParser = require("body-parser"),
 	mongoose = require("mongoose"),
 	moment = require('moment'),
 	methodOverride = require("method-override"),
 	Product = require("./models/product"),
 	Order = require("./models/order");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.locals.moment = moment;

mongoose.connect('mongodb://localhost:27017/final_project', {useNewUrlParser: true, useUnifiedTopology: true});

app.get("/", function(req, res){
	Order.find({}, function(err, orders){
		if(err){
			console.log(err);
		} else {
			res.render("index", {orders: orders});
		}
	});
});

app.post("/:id", function(req, res){
	Order.deleteOne({_id: req.params.id}, function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect("/");
		}				
	});
});

app.get("/new_product", function(req, res){
	res.render("new_product");
});

app.post("/new/product", function(req, res){
	Product.create(req.body.product, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			console.log(newlyCreated);
			res.redirect("/");
		}
	});
});

app.get("/products", function(req, res){
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
				res.render("products", {products: allProducts, noMatch: noMatch, hide: true});
			}
		});
	} else {
		Product.find({}, function(err, allProducts){
			if(err){
				console.log(err);
			} else {
				res.render("products", {products: allProducts, noMatch: noMatch, hide: false});
			}
		});
	}
});

app.get("/products/:id/edit", function(req, res){
	Product.findOne({_id: req.params.id}, function(err, foundProduct){
		if(err){
			console.log(err);
		} else {
			res.render("edit_product", {product: foundProduct});
		}	
	});	
});

app.put("/products/edit/:id", function(req, res){
	Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
		if(err){
			res.redirect("/");
		} else {
			res.redirect("/products");
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

app.listen(3000, function(){
	console.log("Employee server has started..");
});