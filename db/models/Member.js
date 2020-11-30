// https://medium.com/@alicantorun/build-a-rest-api-with-mongodb-mongoose-and-node-js-3a5afc4a0431
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const memberSchema = new Schema({
    hhsid: { type : String , unique : true, required: true, index: true,  dropDups: true },
    userid: { type : String , unique : true, required : true, index: true, dropDups: true },
    Firstname: { type : String , required : true, uppercase: true },
    Lastname: { type : String , required : true, uppercase: true },
    active: { type : Boolean, default: true}
  },
  { collection: "members"},
  { timestamps: true }
);
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;

