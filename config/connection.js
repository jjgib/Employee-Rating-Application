const mongoClient = require('mongodb').MongoClient;
const state = {
    db:null
};

module.exports.connect = async function(done){
    const url = "mongodb://localhost:27017";
    const dbname = "fabmedica_db";

    await mongoClient.connect(url,(err,data)=>{
        if(err) return done(err);
        state.db = data.db(dbname);
        done();
    });
};

module.exports.get = function(){
    return state.db;
};
