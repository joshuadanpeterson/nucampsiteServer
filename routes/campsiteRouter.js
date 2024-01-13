// routes/campsiteRouter.js
const express = require("express");
const { Campsite } = require("../models/campsite");
const campsiteRouter = express.Router();
const authenticate = require("../authenticate");

campsiteRouter
	.route("/")
	.get((req, res, next) => {
		Campsite.find()
			.populate("comments.author")
			.then((campsites) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsites);
			})
			.catch((err) => next(err));
	})
	.post(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			console.log("Attempting to create campsite...");
			console.log("POST request body:", req.body);

			Campsite.create(req.body)
				.then((campsite) => {
					console.log("Campsite Created", campsite);
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite);
				})
				.catch((err) => {
					console.error("Error during Campsite creation:", err);
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
	.put(authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end("PUT operation not supported on /campsites");
	})
	.delete(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
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
		}
	);

// campsiteId
campsiteRouter
	.route("/:campsiteId")
	.get((req, res, next) => {
		const campsiteId = req.params.campsiteId;
		Campsite.findById(campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				res.statusCode = 200;
				res.setHeader("Content-Type", "application/json");
				res.json(campsite);
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res) => {
		const campsiteId = req.params.campsiteId;
		res.statusCode = 403;
		res.end(`POST operation not supported on /campsites/${campsiteId}`);
	})
	.put(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			const campsiteId = req.params.campsiteId;
			Campsite.findByIdAndUpdate(
				campsiteId,
				{
					$set: req.body,
				},
				{
					new: true,
				}
			)
				.then((campsite) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite);
				})
				.catch((err) => next(err));
		}
	)
	.delete(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			const campsiteId = req.params.campsiteId;
			Campsite.findByIdAndDelete(campsiteId)
				.then((response) => {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(response);
				})
				.catch((err) => next(err));
		}
	);

campsiteRouter
	.route("/:campsiteId/comments")
	.get((req, res, next) => {
		const campsiteId = req.params.campsiteId;
		Campsite.findById(campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				if (campsite) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite.comments);
				} else {
					err = new Error(`Campsite ${campsiteId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res, next) => {
		console.log(req.body);
		console.log(req.params);
		const campsiteId = req.params.campsiteId;
		Campsite.findById(campsiteId)
			.then((campsite) => {
				if (campsite) {
					req.body.author = req.user._id;
					campsite.comments.push(req.body);
					campsite
						.save()
						.then((campsite) => {
							res.statusCode = 200;
							res.setHeader("Content-Type", "application/json");
							res.json(campsite);
						})
						.catch((err) => next(err));
				} else {
					err = new Error(`Campsite ${campsiteId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.put(authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`
		);
	})
	.delete(
		authenticate.verifyUser,
		authenticate.verifyAdmin,
		(req, res, next) => {
			const campsiteId = req.params.campsiteId;
			Campsite.findById(campsiteId)
				.then((campsite) => {
					if (campsite) {
						for (
							let i = campsite.comments.length - 1;
							i >= 0;
							i--
						) {
							campsite.comments
								.id(campsite.comments[i]._id)
								.remove();
						}
						campsite
							.save()
							.then((campsite) => {
								res.statusCode = 200;
								res.setHeader(
									"Content-Type",
									"application/json"
								);
								res.json(campsite);
							})
							.catch((err) => next(err));
					} else {
						err = new Error(`Campsite ${campsiteId} not found`);
						err.status = 404;
						return next(err);
					}
				})
				.catch((err) => next(err));
		}
	);

campsiteRouter
	.route("/:campsiteId/comments/:commentId")
	.get((req, res, next) => {
		const campsiteId = req.params.campsiteId;
		const commentId = req.params.commentId;
		Campsite.findById(campsiteId)
			.populate("comments.author")
			.then((campsite) => {
				if (campsite && campsite.comments.id(commentId)) {
					res.statusCode = 200;
					res.setHeader("Content-Type", "application/json");
					res.json(campsite.comments.id(commentId));
				} else if (!campsite) {
					err = new Error(`Campsite ${campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else {
					err = new Error(`Comment ${commentId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.post(authenticate.verifyUser, (req, res) => {
		res.statusCode = 403;
		res.end(
			`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`
		);
	})
	.put(authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;
		const commentId = req.params.commentId;
		Campsite.findById(campsiteId)
			.then((campsite) => {
				if (campsite && campsite.comments.id(commentId)) {
					const comment = campsite.comments.id(commentId);
					if (comment.author._id.equals(req.user._id)) {
						if (req.body.rating) {
							comment.rating = req.body.rating;
						}
						if (req.body.text) {
							comment.text = req.body.text;
						}
						campsite
							.save()
							.then((campsite) => {
								res.statusCode = 200;
								res.setHeader(
									"Content-Type",
									"application/json"
								);
								res.json(campsite);
							})
							.catch((err) => next(err));
					} else {
						err = new Error(
							"You are not authorized to update this comment!"
						);
						err.status = 403;
						return next(err);
					}
				} else if (!campsite) {
					err = new Error(`Campsite ${campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else {
					err = new Error(`Comment ${commentId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	})
	.delete(authenticate.verifyUser, (req, res, next) => {
		const campsiteId = req.params.campsiteId;
		const commentId = req.params.commentId;
		Campsite.findById(campsiteId)
			.then((campsite) => {
				if (campsite && campsite.comments.id(commentId)) {
					const comment = campsite.comments.id(commentId);
					if (comment.author._id.equals(req.user._id)) {
						comment.remove();
						campsite
							.save()
							.then((campsite) => {
								res.statusCode = 200;
								res.setHeader(
									"Content-Type",
									"application/json"
								);
								res.json(campsite);
							})
							.catch((err) => next(err));
					} else {
						err = new Error(
							"You are not authorized to delete this comment!"
						);
						err.status = 403;
						return next(err);
					}
				} else if (!campsite) {
					err = new Error(`Campsite ${campsiteId} not found`);
					err.status = 404;
					return next(err);
				} else {
					err = new Error(`Comment ${commentId} not found`);
					err.status = 404;
					return next(err);
				}
			})
			.catch((err) => next(err));
	});

module.exports = campsiteRouter;
