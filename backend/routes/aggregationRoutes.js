const express = require("express");
const router = express.Router();

const {
  aggregateSerials,
  traceSerial
} = require("../controllers/aggregationController");

// Create aggregation (packing)
router.post("/hierarchy/aggregate", aggregateSerials);

// Trace full hierarchy path
router.get("/hierarchy/trace/:serialNumber", traceSerial);//checking remain


module.exports = router;
