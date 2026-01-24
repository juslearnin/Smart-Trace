const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const unitSchema = new Schema({
  serialNumber: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['PRIMARY', 'SECONDARY', 'TERTIARY'], required: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Unit', default: null, index: true },
  batchId: { type: Schema.Types.ObjectId, ref: 'Batch', required: true },
  verificationHash: { type: String, required: true },
  publicVerificationCode: { type: String, required: true },
  scanHistory: [{
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    status: { type: String, enum: ['VALID', 'SUSPECT', 'INVALID'], default: 'VALID' }
  }]
}, { timestamps: true });

// Compound index for hierarchy Traversal
unitSchema.index({ parentId: 1, type: 1 });

module.exports = mongoose.model('Unit', unitSchema);