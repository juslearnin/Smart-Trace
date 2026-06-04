const mongoose = require("mongoose");

const aggregationSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Serial",
    required: true
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Serial",
    required: true
  }
}, { timestamps: true });

// Prevent duplicate parent-child pairs
aggregationSchema.index({ parent: 1, child: 1 }, { unique: true });
aggregationSchema.index({ child: 1 });
aggregationSchema.index({ parent: 1 });

module.exports = mongoose.model("Aggregation", aggregationSchema);
