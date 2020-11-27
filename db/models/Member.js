// https://medium.com/@alicantorun/build-a-rest-api-with-mongodb-mongoose-and-node-js-3a5afc4a0431
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const memberSchema = new Schema({
    hhsid: String,
    userid: String,
    Firstname: String,
    Lastname: String,
    active: Boolean
  },
  { collection: "members"},
  { timestamps: true }
);
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;

