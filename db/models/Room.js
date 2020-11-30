// IOS Devices and other clients
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MySchema = new Schema({
    rm: { type : String , unique : true, required: true, index: true,  dropDups: true },
    lat: String,
    lng: String,
    active: { type : Boolean, default: true}
  },
  { collection: "rooms"}
);
const Room = mongoose.model("Room", MySchema);
module.exports = Room;

