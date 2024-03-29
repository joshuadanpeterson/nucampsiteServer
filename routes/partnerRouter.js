const express = require("express");
const Partner = require("../models/partner");
const partnerRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require('./cors');

partnerRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get((req, res, next) => {
		Partner.find()
			.then((partners) => {
				console.log("After Partner.find()");
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(partners);
			})
			.catch((err) => next(err));
	})
	.post(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			console.log("POST request body:", req.body);
			console.log("Attempting to create partner...");

			Partner.create(req.body)
				.then((partner) => {
					console.log("Partner Created", partner);
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(partner);
				})
				.catch((err) => {
					console.error("Error during Partner creation:", err);
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
		res.end("PUT operation not supported on /partners");
	})
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Partner.deleteMany()
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

partnerRouter
	.route("/:partnerId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, (req, res, next) => {
		console.log("Requested Partner ID:", req.params.partnerId);
		Partner.findById(req.params.partnerId)
			.then((partner) => {
				console.log("Found Partner:", partner); // Log the found partners
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(partner);
			})
			.catch((err) => {
				console.error("Error retrieving partner:", err);
				next(err);
			});
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /partners/${req.params.partnerId}`
		);
	})
	.put(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Partner.findByIdAndUpdate(
				req.params.partnerId,
				{
					$set: req.body,
				},
				{
					new: true,
				}
			)
				.then((partner) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(partner);
				})
				.catch((err) => next(err));
		}
	)
	.delete(
		cors.corsWithOptions,
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			Partner
				.findByIdAndDelete(req.params.partnerId)
				.then((response) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				})
				.catch((err) => next(err));
		}
	);

module.exports = partnerRouter;
