
const mongoose = require("mongoose");

const serialSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true },

  level: {
    type: String,
    enum: ["primary", "secondary", "tertiary"],
    required: true
  },

  productCode: { type: String, required: true },

  companyPrefix: { type: String, required: true },

  productionDate: { type: Date, required: true },

  checkDigit: { type: Number, required: true },
  checkDigitAlgorithm: {
    type: String,
    enum: ["luhn", "gs1"],
    default: "luhn"
  },
  qrCode: { type: String },  // URL to QR code image

hashValue: { type: String },           // full SHA256
verificationCode: { type: String },   // first 8 chars printed on label
   // for anti-counterfeit later

  status: {
    type: String,
    enum: ["active", "decommissioned"],
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Serial", serialSchema);
