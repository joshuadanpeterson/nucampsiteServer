const express = require("express");
const Promotion = require("../models/promotion");
const promotionRouter = express.Router();

promotionRouter.route("/")
	.get((req, res, next) => {
            console.log("Before Promotion.find()");
	    return res.status(200).json({ message: "Static response" }); // Temporary line for testing
		Promotion.find()
		.then((promotions) => {
			console.log("After Promotion.find()");
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.json(promotions);
		})
		.catch((err) => next(err));
	})
	.post((req, res, next) => {
	    console.log("POST request body:", req.body);
	    console.log("Attempting to create promotion...");

	    Promotion.create(req.body)
		.then(promotion => {
		    console.log("Promotion Created", promotion);
		    res.statusCode = 200;
		    res.setHeader('Content-Type', 'application/json');
		    res.json(promotion);
		})
		.catch(err => {
		    console.error("Error during Promotion creation:", err);
		    console.error(err);
		    res.statusCode = 500;
		    res.setHeader('Content-Type', 'application/json');
		    res.json({ error: err.message, fullError: err });
		});
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /promotions");
	})
	.delete((req, res, next) => {
		Promotion.deleteMany()
			.then((response) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(response);
			})
			.catch((err) => {
				console.error("Error:", err); // Log the error
				next(err);
			});
	});

promotionRouter.route("/:promotionId")
	.get((req, res, next) => {
		console.log("Requested Promotion ID:", req.params.promotionId);
		Promotion.findById(req.params.promotionId)
			.then((promotion) => {
				console.log("Found Promotion:", promotion); // Log the found promotions
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(promotion);
			})
			.catch(err => {
				    console.error("Error retrieving promotion:", err);
				    next(err);
			});
	})
	.post((req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /promotions/${req.params.promotionId}`
		);
	})
	.put((req, res, next) => {
		Promotion.findByIdAndUpdate(
			req.params.promotionId,
			{
				$set: req.body,
			},
			{ new: true }
		)
			.then((promotion) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(promotion);
			})
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		Promotion.findByIdAndDelete(req.params.promotionId)
			.then((response) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(response);
			})
			.catch((err) => next(err));
	});

module.exports = promotionRouter;
