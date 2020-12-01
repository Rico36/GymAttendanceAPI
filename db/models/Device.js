// IOS Devices and other clients
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const deviceSchema = new Schema({
    deviceToken: { type : String , unique : true, required: true, index: true,  dropDups: true },
    deviceName: { type : String , required: true, index: true },
    rm: String,
    active: { type : Boolean, default: false}
  },
  { collection: "devices"},
  { timestamps: true }
);
const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;

