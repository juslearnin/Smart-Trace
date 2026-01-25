const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/adminController");
const {
  generateBatch,
  validateSerial,
  decommissionBatch
} = require("../controllers/serialController");

// 1. Batch Generation (Primary / Secondary / Tertiary)
router.post("/serials/generate-batch", generateBatch);

// 2. Check Digit Validation
router.get("/serials/validate/:serial", validateSerial);

// 3. Batch Decommissioning
router.post("/serials/decommission", decommissionBatch);
// Admin dashboard statistics
router.get("/serials/admin/stats", getAdminStats);


module.exports = router;
