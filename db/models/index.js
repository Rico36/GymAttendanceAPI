const dbConfig = require("../db.config.js");

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.WellnessCenter_db = require("./model.js")(mongoose);

module.exports = db;