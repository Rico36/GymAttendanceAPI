// IOS Devices and other clients
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MySchema = new Schema({
    rm: String,
    lat: String,
    lng: String,
    active: { type : Boolean, default: false}
  },
  { collection: "rooms"}
);
const Room = mongoose.model("Room", MySchema);
module.exports = Room;

