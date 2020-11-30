// https://medium.com/@alicantorun/build-a-rest-api-with-mongodb-mongoose-and-node-js-3a5afc4a0431
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const checkinSchema = new Schema({
    userid: { type : String , required: true, index: true,  dropDups: false },
    date: { type : Date , required: true, index: true,  dropDups: false },
    rm: { type : String , required: true, index: true,  dropDups: false },
    lat: String,
    lng: String
  },
  { collection: "Checkins"},
);
const Checkin = mongoose.model("Checkin", checkinSchema);
module.exports = Checkin;

