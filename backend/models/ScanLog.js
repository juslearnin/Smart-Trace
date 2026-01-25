const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema({
  serial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Serial",
    required: true
  },

  status: {
    type: String,
    enum: ["VALID", "SUSPECT", "INVALID"],
    required: true
  },

  location: { type: String },

  scannedAt: { type: Date, default: Date.now }
});

scanLogSchema.index({ serial: 1, scannedAt: 1 });

module.exports = mongoose.model("ScanLog", scanLogSchema);
