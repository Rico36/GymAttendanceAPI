// IOS Devices and other clients
//
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const deviceSchema = new Schema({
    deviceToken: String,
    deviceName: String,
    rm: String,
    active: Boolean
  },
  { collection: "devices"},
  { timestamps: true }
);
const Device = mongoose.model("Device", deviceSchema);
module.exports = Device;
