const express = require("express");
const Campsite = require("../models/campsite");
const campsiteRouter = express.Router();

campsiteRouter.route("/")
	.get((req, res, next) => {
            console.log("Before Campsite.find()");
	    return res.status(200).json({ message: "Static response" }); // Temporary line for testing
		Campsite.find()
		.then((campsites) => {
			console.log("After Campsite.find()");
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.json(campsites);
		})
		.catch((err) => next(err));
	})
	.post((req, res, next) => {
	    console.log("POST request body:", req.body);
	    console.log("Attempting to create campsite...");

	    Campsite.create(req.body)
		.then(campsite => {
		    console.log("Campsite Created", campsite);
		    res.statusCode = 200;
		    res.setHeader('Content-Type', 'application/json');
		    res.json(campsite);
		})
		.catch(err => {
		    console.error("Error during Campsite creation:", err);
		    console.error(err);
		    res.statusCode = 500;
		    res.setHeader('Content-Type', 'application/json');
		    res.json({ error: err.message, fullError: err });
		});
	})
	.put((req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /campsites");
	})
	.delete((req, res, next) => {
		Campsite.deleteMany()
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

// In campsiteRouter.js
campsiteRouter.route('/test')
.get((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({message: 'Test route in campsiteRouter is working'});
});

// campsiteId
campsiteRouter.route("/:campsiteId")
	.get((req, res, next) => {
		console.log("Requested Campsite ID:", req.params.campsiteId);
		Campsite.findById(req.params.campsiteId)
			.then((campsite) => {
				console.log("Found Campsite:", campsite); // Log the found campsites
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsite);
			})
			.catch(err => {
				    console.error("Error retrieving campsite:", err);
				    next(err);
			});
	})
	.post((req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}`
		);
	})
	.put((req, res, next) => {
		Campsite.findByIdAndUpdate(
			req.params.campsiteId,
			{
				$set: req.body,
			},
			{ new: true }
		)
			.then((campsite) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsite);
			})
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		Campsite.findByIdAndDelete(req.params.campsiteId)
			.then((response) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(response);
			})
			.catch((err) => next(err));
	});

module.exports = campsiteRouter;
