'use strict';

/**
 * Module dependencies.
 */
 var _ = require('lodash'),
 path = require('path'),
 mongoose = require('mongoose'),
 Project = mongoose.model('Project'),
 errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
 knox = require(path.resolve('./config/lib/knox.js')),
 knoxClient = knox.knoxClient;
/**
 * Create a Project
 */
 exports.create = function(req, res) {
 	var project = new Project(req.body);
 	project.user = req.user;

 	project.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.jsonp(project);
 		}
 	});
 };

/**
 * Show the current Project
 */
 exports.read = function(req, res) {
 	res.jsonp(req.project);
 };

/**
 * Update a Project
 */
 exports.update = function(req, res) {
 	var project = req.project ;

 	project = _.extend(project , req.body);

 	project.save(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.jsonp(project);
 		}
 	});
 };

/**
 * Delete an Project
 */
 exports.delete = function(req, res) {
 	var project = req.project ;

 	project.remove(function(err) {
 		if (err) {
 			return res.status(400).send({
 				message: errorHandler.getErrorMessage(err)
 			});
 		} else {
 			res.jsonp(project);
 		}
 	});
 };

/**
 * List of Projects
 */
 exports.list = function(req, res) {
 	if (req.query.userId)
 	{
 		Project.find()
 		.where('user').equals(req.query.userId)
 		.sort('-created')
 		.populate('user', 'displayName')
 		.exec(function(err, projects) {
 			if (err) {
 				return res.status(400).send({
 					message: errorHandler.getErrorMessage(err)
 				});
 			} else {
 				res.jsonp(projects);
 			}
 		});
 	}
 	else
 	{
 		if(req.query.projectName) {
 			Project.find().
 			where('name').regex(new RegExp(req.query.projectName, 'i')).
 			sort('-created').populate('user', 'displayName').
 			exec(function(err, projects) {
 				if (err) {
 					return res.status(400).send({
 						message: errorHandler.getErrorMessage(err)
 					});
 				} else {
 					res.jsonp(projects);
 				}
 			});
 		} else if(req.query.benchmark) {
 			Project.find().
 			where('benchmark').equals(req.query.benchmark).
 			sort('-created').populate('user', 'displayName').
 			exec(function(err, projects) {
 				if (err) {
 					return res.status(400).send({
 						message: errorHandler.getErrorMessage(err)
 					});
 				} else {
 					res.jsonp(projects);
 				}
 			});
 		} else if(req.query.subject) {
 			Project.find().
 			where('minGrade').gte(req.query.minGrade).
 			where('maxGrade').lte(req.query.maxGrade).
 			where('subject').equals(req.query.subject).
 			sort('-created').populate('user', 'displayName').
 			exec(function(err, projects) {
 				if (err) {
 					return res.status(400).send({
 						message: errorHandler.getErrorMessage(err)
 					});
 				} else {
 					res.jsonp(projects);
 				}
 			});
 		} else {
 			Project.find().
 			where('minGrade').gte(req.query.minGrade).
 			where('maxGrade').lte(req.query.maxGrade).
 			sort('-created').populate('user', 'displayName').
 			exec(function(err, projects) {
 				if (err) {
 					return res.status(400).send({
 						message: errorHandler.getErrorMessage(err)
 					});
 				} else {
 					res.jsonp(projects);
 				}
 			});
 		}
 	}
 };

/**
 * Upload picture for project
 */
 exports.uploadDiagram = function (req,res){
	 console.log("Uploading")

	 var project = req.project;
	 knoxClient.putBuffer(req.files.file.buffer, 'ProjectDrawings/' + req.files.file.name,{'Content-Type': 'image/jpeg'},function(uploadError){
		 if (uploadError) {
			 return res.status(400).send({
				 message: 'Error occurred while uploading project drawing'
			 });
		 } else {
			 knoxClient.deleteFile(project.imagine.plan.substring(project.imagine.plan.search('ProjectDrawings/')),{'Content-Type': 'image/jpeg'}, function(err){
				 if(err){
					 return err.message;
				 }
			 });
			 project.imagine.plan = 'https://s3.amazonaws.com/isslepictures/ProjectDrawings/' + req.files.file.name;
			 console.log('updating pic');
			 project.save(function(err) {
				 if (err) {
					 return res.status(400).send({
						 message: errorHandler.getErrorMessage(err)
					 });
				 } else {
					 res.jsonp(project);
				 }
			 });
			 console.log('done upload');
		 }
	 });
 };

/**
 * Project middleware
 */
 exports.projectByID = function(req, res, next, id) { Project.findById(id).populate('user', 'displayName').exec(function(err, project) {
 	if (err) return next(err);
 	if (! project) return next(new Error('Failed to load Project ' + id));
 	req.project = project ;
 	next();
 });
};
