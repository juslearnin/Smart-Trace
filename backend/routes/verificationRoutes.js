const express = require("express");
const router = express.Router();


const {
  scanAndVerify,
  verifyHierarchy
} = require("../controllers/verificationController");

// Main scan & verify
router.post("/scan", scanAndVerify);

// Hierarchy verification
router.post("/hierarchy", verifyHierarchy);

module.exports = router;
