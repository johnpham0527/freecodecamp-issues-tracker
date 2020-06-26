/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const https = require('https');
const getDb = require('../db'); //import db in order to set up POST and test PUT

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
           assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.isNotNull(res.body._id);
          assert.isNotNull(res.body.created_on);
          assert.isNotNull(res.body.updated_on);
          assert.equal(res.body.open, true);
         
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every required field filled in',
          })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title');
          assert.equal(res.body.issue_text, 'text');
          assert.equal(res.body.created_by, 'Functional Test - Every required field filled in');
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing inputs');
          
            done();
        })

      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
           _id: '5ee911e1a74ab200dd812634'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no updated field sent');
          done();
        })
      });
      
      test('Missing id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing id');
            done();
        })
      })
      
      test('One field to update', function(done) {
        
        try {

          let responseId;
          let project = 'test';

          let testData = {
              issue_title: 'Title',
              issue_text: 'text',
              created_by: 'Functional Test - Every field filled in',
              assigned_to: 'Chai and Mocha',
              status_text: 'In QA'
          };

          getDb.then(function(db) {
            db.collection(project) //access the test collection
              .insertOne(testData, function(err, result) { //insert the test data into database
                if (err) console.log(`Error creating new document: ${err}`);

                responseId = result.insertedId; //keep track of the resulting returned document ID

                chai.request(server) //test the PUT route
                .put('/api/issues/text')
                .send({
                  _id: responseId,
                  assigned_to: 'John Pham'
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'successfully updated');
                });

                done();
            });
          });
        
        }
        catch(err) {
          console.log(`Error: ${err}`)
        }
          
      });      

      
      test('Multiple fields to update', function(done) {
        
        try {

          let responseId;
          let project = 'test';

          let testData = {
              issue_title: 'Title',
              issue_text: 'text',
              created_by: 'Functional Test - Every field filled in',
              assigned_to: 'Chai and Mocha',
              status_text: 'In QA'
          };

          getDb.then(function(db) {
            db.collection(project) //access the test collection
              .insertOne(testData, function(err, result) { //insert the test data into database
                if (err) console.log(`Error creating new document: ${err}`);

                responseId = result.insertedId; //keep track of the resulting returned document ID

                chai.request(server) //test the PUT route
                .put('/api/issues/text')
                .send({
                  _id: responseId,
                  assigned_to: 'John Pham',
                  created_by: 'John Pham',
                  issue_title: 'Glitch',
                  issue_text: 'There appears to be a glitch...'
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, 'successfully updated')
                  done();
                });
            });
          });
        
        }
        catch(err) {
          console.log(`Error: ${err}`)
        }
      });   
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            open: false
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.property(res.body[0], 'issue_text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'updated_on');
            assert.property(res.body[0], 'created_by');
            assert.property(res.body[0], 'assigned_to');
            assert.property(res.body[0], 'open');
            assert.property(res.body[0], 'status_text');
            assert.property(res.body[0], '_id');
            assert.equal(res.body[0].open, false);
            done();
          });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        try {
          const now = new Date(); //use this for timestamp
      
          let testData1 = {
              issue_title: 'A Strange Error',
              issue_text: 'We are encountering a strange error...',
              created_by: 'John Pham',
              assigned_to: 'John Pham',
              status_text: 'Finished',
              created_on: now,
              updated_on: now,
              open: true,
          };     
        
          let testData2 = {
              issue_title: 'A Weird Glitch',
              issue_text: 'Not sure why we are seeing this glitch...',
              created_by: 'John Pham',
              assigned_to: 'John Pham',
              status_text: 'Finished',
              created_on: now,
              updated_on: now,
              open: true,
          }; 
        
          let testData3 = {
              issue_title: 'A Strange Error',
              issue_text: 'Yet another strange error',
              created_by: 'John Pham',
              assigned_to: 'John Pham',
              status_text: 'Finished',
              created_on: now,
              updated_on: now,
              open: true,
          }; 
        
          let testData4 = {
              issue_title: 'A Strange Error',
              issue_text: 'Yet another strange error',
              created_by: 'John Pham',
              assigned_to: 'John Pham',
              status_text: 'Not Finished',
              created_on: now,
              updated_on: now,
              open: true,
          }; 
        
          let project = 'test';
        
          getDb.then(function(db) {
            db.collection(project) //access the test collection
              .insertMany([testData1, testData2, testData3, testData4], function(err, result) { //insert the two test data samples into database
                if (err) console.log(`Error creating new document: ${err}`);
                chai.request(server) //test the PUT route
                  .get('/api/issues/test')
                  .query({
                    issue_title: 'A Strange Error',
                    status_text: 'Finished'
                  })
                  .end(function(err, res) {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.property(res.body[0], 'issue_title');
                    assert.property(res.body[0], 'issue_text');
                    assert.property(res.body[0], 'created_on');
                    assert.property(res.body[0], 'updated_on');
                    assert.property(res.body[0], 'created_by');
                    assert.property(res.body[0], 'assigned_to');
                    assert.property(res.body[0], 'open');
                    assert.property(res.body[0], 'status_text');
                    assert.property(res.body[0], '_id');
                    assert.equal(res.body[0].status_text, 'Finished');
                    assert.equal(res.body[0].issue_title, 'A Strange Error');
                    assert.equal(res.body[1].status_text, 'Finished');
                    assert.equal(res.body[1].issue_title, 'A Strange Error');
                    done();
                  });
            });
          });
        }
        catch(err) {
          console.log(`Error: ${err}`);
        }  
      });
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server) //test the route
          .delete('/api/issues/text')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, '_id error');
            done();
          });
      });
        
        
      
      test('Valid _id', function(done) {
        try {

          let responseId;
          const project = 'test';
          const now = new Date(); //use this for timestamp

          let testData = {
              issue_title: 'A Strange Error',
              issue_text: 'Yet another strange error',
              created_by: 'John Pham',
              assigned_to: 'John Pham',
              status_text: 'Not Finished',
              created_on: now,
              updated_on: now,
              open: true,
          };

          getDb.then(async function(db) {
            await db.collection(project) //access the test collection
              .insertOne(testData, function(err, insertResult) { //insert the test data into database
                if (err) console.log(`Error creating new document: ${err}`);

                responseId = insertResult.insertedId; //keep track of the resulting returned document ID

                chai.request(server) //test the route
                .delete('/api/issues/' + project)
                .send({
                  _id: responseId,
                })
                .end(function(err, res) {
                  db.collection(project)
                    .findOne({_id: responseId}, function(err, deleteResult) { //attempt to find the document that was just deleted
                      if(err) console.log(`Error finding document: ${err}`);
                      assert.equal(res.status, 200);
                      assert.equal(res.text, 'deleted ' + responseId);
                      assert.isNull(deleteResult, 'The returned result on the deleted document should be null');
                      done();
                    })

                });
            })
          });

        }
        catch (err) {
          console.log(`Error: ${err}`);
        }
        
      });
      
    });
  
});