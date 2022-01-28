var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Product = require("../models/product");
var CartItem = require("../models/cartItem");
var Order = require("../models/order");
var middleware = require("../middleware");
var nodemailer = require("nodemailer");
var async = require("async");
var crypto = require("crypto");

//auth routes
router.get("/register", function(req, res){
	res.render("register");
});

router.post("/register", function(req, res){
	var newUser = new User({
		username: req.body.username,
		houseNumber: req.body.housenumber,
		area: req.body.area,
		city: req.body.city,
		country: req.body.country,
		phoneNumber: req.body.phonenumber,
		name: req.body.name,
		state: req.body.state
	});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
    		console.log(err);
    		return res.render("register", {error: err.message});
		} else {
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Welcome " + user.username);
				res.redirect("/");
			});
		}
	});
});

router.get("/profile/:id", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}, function(err, foundUser){
		if(err || !foundUser){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			res.render("users/profile", {user: foundUser});
		}
	});	
});

router.put("/profile/:id", middleware.isLoggedIn, function(req, res){
	User.findByIdAndUpdate(req.params.id, req.body.user, function(err, updatedUser){
		if(err){
			res.redirect("/");
		} else {
			res.redirect("/");
		}
	});
});

router.delete("/profile/:id", middleware.isLoggedIn, function(req, res){
	User.findByIdAndRemove(req.params.id, function(err){
		if (err) {
			res.redirect("/");
		} else {
			res.redirect("/");
		}
	});
});

router.get("/login", function(req, res){
	res.render("login");
});

router.post("/login",passport.authenticate("local",{
	successRedirect: "/",
	failureRedirect: "/login"
}), function(req, res){
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/");
});

router.post("/:id/cart/:product_id", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}, function(err, user){
		if(err || !user){
			console.log(err);
			res.redirect("/");
		} else {
			Product.findOne({_id: req.params.product_id}, function(err, product){
				if(err || !product){
					console.log(err);
					res.redirect("/");
				} else {
					var newCartItem = {quantity: req.body.quantity, name: product.name, price: product.price};
					CartItem.create(newCartItem, function(err, newlyCreated){
						if(err){
							console.log(err);
						} else {
						req.flash("success", "Item Added to Cart.");
						newlyCreated.owner = user;
						console.log(newlyCreated);
						newlyCreated.save();
						user.cart.push(newlyCreated);
						user.save();
						console.log("added product to cart!");
						res.redirect("back");
						}
					});	
				}
			});
		}
	});
});

router.get("/:id/cart", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}).populate("cart").exec(function(err, user){
		if(err || !user){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			res.render("cart", {user: user});
		}
	});	
});

router.delete("/:id/cart/:cartItem_id", middleware.checkCartItemOwnership, middleware.isLoggedIn, function(req, res){
	CartItem.findByIdAndRemove(req.params.cartItem_id, function(err){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Item deleted.");
			res.redirect("/" + req.params.id + "/cart");
		}
	});
});

router.get("/:id/cart/checkout", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}).populate("cart").exec(function(err, user){
		if(err || !user){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			var total = 0;
			user.cart.forEach(function(cartItem){
				total += cartItem.price*cartItem.quantity;
			});
			res.render("checkout", {user: user, total: total});
		}
	});	
});

router.post("/:id/checkout", middleware.isLoggedIn,function(req, res){
	User.findOne({_id: req.params.id}).populate("cart").exec(function(err, user){
		if(err || !user){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			console.log("user found");
			var order = {
				customer: user.name,
				houseNumber: user.houseNumber,
				area: user.area,
				city: user.city,
				state: user.state,
				country: user.country,
				phoneNumber: user.phoneNumber,
			};
			Order.create(order, function(err, newOrder){
				if(err){
					console.log(err);
				} else {
					console.log("order created");
					user.cart.forEach(function(cartItem){
						var innerOrder = {product: cartItem.name, price: cartItem.price, quantity: cartItem.quantity};
						newOrder.order.push(innerOrder);
						CartItem.findByIdAndRemove(cartItem.id, function(err){
							if(err){
								res.redirect("back");
							}
						});
					});
					newOrder.save();
					user.orders.push(newOrder);
					user.save();
					console.log(newOrder);
					req.flash("success", "Order is Placed!");
					res.redirect("/");
				}
			});		
		}
	});
});

router.post("/checkout2/:id/:product_id", middleware.isLoggedIn, function(req, res){
	Product.findOne({_id: req.params.product_id}, function(err, product){
		if(err || !product){
			req.flash("error", "Product not found!");
			res.redirect("back");
		} else {
			User.findOne({_id: req.params.id}, function(err, user){
				if(err || !user){
					/*req.flash("error", "User not found!");*/
					res.redirect("back");
				} else {
					res.render("checkout2", {user: user, product: product, quantity: req.body.quantity});
				}
			});	
		}				
	});
});	

router.post("/:id/checkout2/:product_id/:quantity", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}, function(err, user){
		if(err || !user){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			console.log("user found");
			var order = {
				customer: user.name,
				houseNumber: user.houseNumber,
				area: user.area,
				city: user.city,
				country: user.country,
				state: user.state,
				phoneNumber: user.phoneNumber,
			};
			Order.create(order, function(err, newOrder){
				if(err){
					console.log(err);
				} else {
					console.log("order created");
					Product.findOne({_id: req.params.product_id}, function(err, foundProduct){
						var order = {product: foundProduct.name, price: foundProduct.price, quantity: req.params.quantity};
						newOrder.order.push(order);
						newOrder.save();
						user.orders.push(newOrder);
						user.save();
						console.log(newOrder);
						req.flash("success", "Order is Placed!");
						res.redirect("/");
					});
				}
			});			
		}
	});
});

router.get("/:id/orders", middleware.isLoggedIn, function(req, res){
	User.findOne({_id: req.params.id}).populate("orders").exec(function(err, user){
		if(err || !user){
			req.flash("error", "User not found!");
			res.redirect("back");
		} else {
			res.render("myOrders", {user: user});
		}
	});	
});

router.put("/:id/:cartItem_id/qtyChange", middleware.checkCartItemOwnership, middleware.isLoggedIn, function(req, res){
	CartItem.findByIdAndUpdate(req.params.cartItem_id, req.body.cartItem, function(err, updatedCartItem){
		if(err){
			res.redirect("back");
		} else {
			res.redirect("/" + req.params.id + "/cart");
		}
	});
});

router.get("/forgotPassword", function(req, res){
	res.render("forgotPassword");
});

router.post('/forgotPassword', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ username: req.body.username }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'rajpalessentials@gmail.com',
          pass: 'bharat #rajpal #3'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'rajpalessentials@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.username + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgotPassword');
  });
});

router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgotPassword');
    }
    res.render('resetPassword', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'rajpalessentials@gmail.com',
          pass: 'bharat #rajpal #3'
        }
      });
      var mailOptions = {
        to: user.username,
        from: 'rajpalessentials@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.username + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

module.exports = router;