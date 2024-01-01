const express = require("express");
const campsiteRouter = express.Router();

campsiteRouter
	.route("/")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end("Will send all the campsites to you");
	})
	.post((req, res) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Will add the campsite: ${req.body.name} with description: ${req.body.description}`,
		});
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /campsites");
	})
	.delete((req, res) => {
		res.end("Deleting all campsites");
	});

campsiteRouter
	.route("/:campsiteId")
	.all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader("Content-Type", "text/plain");
		next();
	})
	.get((req, res) => {
		res.end(
			`Will send details of the campsite: ${req.params.campsiteId} to you`
		);
	})
	.post((req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}`
		);
	})
	.put((req, res) => {
		console.log("Received body:", req.body); // Log the received body
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.json({
			message: `Updating the campsite: ${req.params.campsiteId}.`,
			updatedName: req.body.name,
			updatedDescription: req.body.description,
		});
	})
	.delete((req, res) => {
		res.end(`Deleting campsite: ${req.params.campsiteId}`);
	});

module.exports = campsiteRouter;
