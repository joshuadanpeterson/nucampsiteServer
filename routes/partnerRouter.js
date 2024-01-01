const express = require("express");
const partnerRouter = express.Router();

partnerRouter
	.route("/")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end("Will send all the partners to you");
	})
	.post((req, res) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Will add the partner: ${req.body.name} with description: ${req.body.description}`,
		});
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /partners");
	})
	.delete((req, res) => {
		res.end("Deleting all partners");
	});

partnerRouter
	.route("/:partnerId")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end(
			`Will send details of the partner: ${req.params.partnerId} to you`
		);
	})
	.post((req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /partners/${req.params.partnerId}`
		);
	})
	.put((req, res) => {
		console.log("Received body:", req.body); // Log the received body
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Updating the partner: ${req.params.partnerId}.`,
			updatedName: req.body.name,
			updatedDescription: req.body.description,
		});
	})
	.delete((req, res) => {
		res.end(`Deleting partner: ${req.params.partnerId}`);
	});

module.exports = partnerRouter;
