const express = require("express");
const router = express.Router();

const {
  aggregateSerials,
  traceSerial
} = require("../controllers/aggregationController");

// Create aggregation (packing)
router.post("/aggregate", aggregateSerials);

// Trace full hierarchy path
router.get("/trace/:serialNumber", traceSerial);//checking remain


module.exports = router;
