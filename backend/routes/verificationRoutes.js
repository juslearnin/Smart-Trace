const express = require("express");
const router = express.Router();


const {
  scanAndVerify,
  verifyHierarchy
} = require("../controllers/verificationController");

// Main scan & verify
router.post("/verify/scan", scanAndVerify);

// Hierarchy verification
router.post("/verify/hierarchy", verifyHierarchy);

module.exports = router;
