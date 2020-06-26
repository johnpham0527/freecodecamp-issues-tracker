/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var getDb = require('../db');
var ObjectId = require('mongodb').ObjectID;
var expect = require('chai').expect;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res, next){
      var project = req.params.project;

      //console.log(`req.query is ${JSON.stringify(req.query)}`);
    
      const { open } = req.query;
    
      let queryData = req.query;
    
      if (open) {
        queryData.open  = (open === 'true');
      }
    
      //console.log(`queryData.open = ${queryData.open} and is type ${typeof queryData.open}`);  
    
      let returnData = [];
    
      getDb.then(function(db) {
        db.collection(project, function(err, collection) {
          if (err) {
            console.log(`Error retrieving collection: ${err}`);
            return next(err);
          }
          collection.find(queryData).toArray(function (err, data) {
            if (err) {
              console.log(`Error retrieving documents: ${err}`);
              return next(err);
            }
            return res.send(data);
          })

        })
      })
      .catch(err => {
        console.log(`Error: ${err}`);
        return next(err);
      }); 
    })
    
    .post(function (req, res, next){
      var project = req.params.project;
    
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
    
      if (issue_title && issue_text && created_by) { //if these properties exist in req.body, insert the document and return JSON body
    
          const now = new Date(); //use this for timestamp
        
          var returnJSON =
          {
              issue_title: req.body.issue_title,
              issue_text: req.body.issue_text,
              created_by: req.body.created_by,
              assigned_to: req.body.assigned_to,
              status_text: req.body.status_text,
              created_on: now,
              updated_on: now,
              open: true,
          };
        
          getDb.then(function(db) {
            db.collection(project) //access collection of the specified project
            .insertOne(
              returnJSON,
              function(err, result) {
                if (err) {
                  console.log(`Error creating new document: ${err}`);
                  return next(err);
                }
                returnJSON._id = result.insertedId; //set returnJSON's id to the resulting document ID
                return res.json(returnJSON);
              }
            );
          });

      }
      else { //missing required fields
          return res.send('missing inputs');
      }
    })
    
    .put(function (req, res, next){
      var project = req.params.project;
      
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      
      if (!_id) { //missing id
        return res.send('missing id');
      }
    
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) { //empty body
        return res.send('no updated field sent');
      }
    
    
      let updateData = {};
    
      if (issue_title) {
        updateData.issue_title = issue_title;
      }
    
      if (issue_text) {
        updateData.issue_text = issue_text;
      }
    
      if (created_by) {
        updateData.created_by = created_by;
      }
    
      if (assigned_to) {
        updateData.assigned_to = assigned_to;
      }
    
      if (status_text) {
        updateData.status_text = status_text;
      }
      if (open) {
        updateData.open = (open === 'true'); //store this as a boolean
      }
    
      const now = new Date(); //use this for timestamp
    
      updateData.updated_on = now;
    
      let result;
    
      getDb.then(function(db) {
        db.collection(project)
        .updateOne(
          { _id: ObjectId(req.body._id) },
          { $set: updateData },
          { upsert: false }
        )
      })
      .then(result => {
        return res.send('successfully updated');
      })
      .catch(err => {
        res.send('could not update ' + _id);
        return next(err);
      });
    })
    
    .delete(function (req, res, next){
      var project = req.params.project;
      
      const {_id} = req.body;
    
      if (!_id) { //missing id
        return res.send('_id error');
      }
    
      getDb.then(function(db) {
        db.collection(project)
        .remove({_id: ObjectId(_id)}, true, function(err, result) {
          if (err) {
            console.log(`Error removing document: ${err}`);
            return res.send('could not delete ' + _id);
          }
          return res.send('deleted ' + _id);
        })
      })
    });
    
};
