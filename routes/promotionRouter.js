const express = require("express");
const Promotion = require("../models/promotion");
const promotionRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require('./cors');

promotionRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		Promotion.find()
			.then((promotions) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(promotions);
			})
			.catch((err) => next(err));
	})
	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			console.log("POST request body:", req.body);
			console.log("Attempting to create promotion...");

			Promotion.create(req.body)
				.then((promotion) => {
					console.log("Promotion Created", promotion);
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(promotion);
				})
				.catch((err) => {
					console.error("Error during Promotion creation:", err);
					console.error(err);
					res.statusCode = 500;
					res.setHeader("Content-Type", "application/json");
					res.json({
						error: err.message,
						fullError: err,
					});
				});
		}
	)
	.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /promotions");
	})
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
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
		}
	);

promotionRouter
	.route("/:promotionId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		console.log("Requested Promotion ID:", req.params.promotionId);
		Promotion.findById(req.params.promotionId)
			.then((promotion) => {
				console.log("Found Promotion:", promotion); // Log the found promotions
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(promotion);
			})
			.catch((err) => {
				console.error("Error retrieving promotion:", err);
				next(err);
			});
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /promotions/${req.params.promotionId}`
		);
	})
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Promotion.findByIdAndUpdate(
				req.params.promotionId,
				{
					$set: req.body,
				},
				{
					new: true,
				}
			)
				.then((promotion) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(promotion);
				})
				.catch((err) => next(err));
		}
	)
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Promotion
				.findByIdAndDelete(req.params.promotionId)
				.then((response) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				})
				.catch((err) => next(err));
		}
	);

module.exports = promotionRouter;
