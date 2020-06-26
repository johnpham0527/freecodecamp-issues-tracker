const MongoClient= require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;

function getDb() {
  return MongoClient
    .connect(CONNECTION_STRING)
    .then(client => {
      return client.db('issues');
    })
    .catch(err => {
      console.log('Database error: ' + err);
  })
}

module.exports = getDb();