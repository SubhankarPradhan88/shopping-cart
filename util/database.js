const mongodb = require('mongodb');         // mongodb package
const MongoClient =  mongodb.MongoClient;   // Constructor function

let _db;
// Establish the db connection
const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://subhankar:Township88@cluster0.lrhlo.mongodb.net/shop?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(client => {
        console.log('Connected!');
        _db = client.db();
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
}
// Return the db instance
const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;