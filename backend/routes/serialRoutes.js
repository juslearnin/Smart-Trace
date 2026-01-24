const express = require("express");
const router = express.Router();

const {
  generateBatch,
  validateSerial,
  decommissionBatch
} = require("../controllers/serialController");

// 1. Batch Generation (Primary / Secondary / Tertiary)
router.post("/generate-batch", generateBatch);

// 2. Check Digit Validation
router.get("/validate/:serial", validateSerial);

// 3. Batch Decommissioning
router.post("/decommission", decommissionBatch);

module.exports = router;
