const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const batchSchema = new Schema({
  batchId: { type: String, required: true, unique: true },
  productName: { type: String, required: true },
  productCode: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  productionDate: { type: Date, default: Date.now },
  isDecommissioned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Batch', batchSchema);