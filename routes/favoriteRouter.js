// routes/favoriteRouter.js
const express = require("express");
const Favorite = require("../models/favorite");
const favoriteRouter = express.Router();
const authenticate = require("../authenticate");
const cors = require("./cors");

favoriteRouter
	.route("/")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
		Favorite.find({
			user: req.user._id,
		})
			.populate("user")
			.populate("campsites")
			.then((favorites) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(favorites);
			})
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOne({
			user: req.user._id,
		})
			.then((favorite) => {
				if (favorite) {
					// The user already has a favorite document
					const campsiteIds = req.body.map(
						(campsite) => campsite._id
					);
					campsiteIds.forEach((campsiteId) => {
						if (!favorite.campsites.includes(campsiteId)) {
							favorite.campsites.push(campsiteId);
						}
					});
					favorite
						.save()
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						})
						.catch((err) => next(err));
				} else {
					// No favorite document for the user, create a new one
					Favorite.create({
						user: req.user._id,
						campsites: req.body.map((campsite) => campsite._id),
					})
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						})
						.catch((err) => next(err));
				}
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /favorite");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		Favorite.findOneAndDelete({
			user: req.user._id,
		})
			.then((favorite) => {
				if (favorite) {
					// A favorite document was found and deleted
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(favorite);
				} else {
					// No favorite document was found for the user
					res.statusCode = 200;
					res.setHeader("Content-Type", "text/plain");
					res.end("You do not have any favorites to delete.");
				}
			})
			.catch((err) => next(err));
	});

// campsiteId
favoriteRouter
	.route("/:campsiteId")
	.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
	.get(cors.cors, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("GET operation not supported on /favorites/:campsiteId");
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;

		Favorite.findOne({
			user: req.user._id,
		})
			.then((favorite) => {
				if (favorite) {
					// User already has a favorites document
					if (!favorite.campsites.includes(campsiteId)) {
						// Campsite not in favorites, add it
						favorite.campsites.push(campsiteId);
						favorite
							.save()
							.then((favorite) => {
								res.statusCode = 200;
								res.setHeader(
									"Content-Type",
									"application/json"
								);
								res.json(favorite);
							})
							.catch((err) => next(err));
					} else {
						// Campsite already in favorites
						res.statusCode = 200;
						res.setHeader("Content-Type", "text/plain");
						res.end(
							"That campsite is already in the list of favorites!"
						);
					}
				} else {
					// User does not have a favorites document, create a new one
					Favorite.create({
						user: req.user._id,
						campsites: [campsiteId],
					})
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						})
						.catch((err) => next(err));
				}
			})
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /favorites/:campsiteId");
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;

		Favorite.findOne({
			user: req.user._id,
		})
			.then((favorite) => {
				if (favorite) {
					// User has a favorites document
					const index = favorite.campsites.indexOf(campsiteId);
					if (index >= 0) {
						// Campsite is in favorites, remove it
						favorite.campsites.splice(index, 1);
					} else {
						// Campsite not in favorites, respond accordingly
						res.statusCode = 200;
						res.setHeader("Content-Type", "text/plain");
						res.end("Campsite not found in favorites.");
						return;
					}

					favorite
						.save()
						.then((favorite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(favorite);
						})
						.catch((err) => next(err));
				} else {
					// User does not have any favorites
					res.statusCode = 200;
					res.setHeader("Content-Type", "text/plain");
					res.end("No favorites found.");
				}
			})
			.catch((err) => next(err));
	});

module.exports = favoriteRouter;
