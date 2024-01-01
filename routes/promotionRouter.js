const express = require("express");
const promotionRouter = express.Router();

promotionRouter
	.route("/")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end("Will send all the promotions to you");
	})
	.post((req, res) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Will add the promotion: ${req.body.name} with description: ${req.body.description}`,
		});
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /promotions");
	})
	.delete((req, res) => {
		res.end("Deleting all promotions");
	});

promotionRouter
	.route("/:promotionId")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end(
			`Will send details of the promotion: ${req.params.promotionId} to you`
		);
	})
	.post((req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /promotions/${req.params.promotionId}`
		);
	})
	.put((req, res) => {
		console.log("Received body:", req.body); // Log the received body
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Updating the promotion: ${req.params.promotionId}.`,
			updatedName: req.body.name,
			updatedDescription: req.body.description,
		});
	})
	.delete((req, res) => {
		res.end(`Deleting promotion: ${req.params.promotionId}`);
	});

module.exports = promotionRouter;
