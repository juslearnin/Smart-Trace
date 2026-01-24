const Serial = require("../models/Serial");
const ScanLog = require("../models/ScanLog");
const { validateLuhn } = require("../utils/luhn");
const Aggregation = require("../models/Aggregation");
const { verifyHash } = require("../utils/hash");


async function scanAndVerify(req, res) {
  try {
    const { serialNumber, location, verificationCode } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ message: "serialNumber is required" });
    }

    // 1. Check digit validation
    const checkValid = validateLuhn(serialNumber);
    if (!checkValid) {
      return res.json({
        status: "INVALID",
        reason: "CHECK_DIGIT",
        message: "Check digit invalid. Possible tampering."
      });
    }

    // 2. Check if serial exists
    const serial = await Serial.findOne({ serialNumber });

    if (!serial) {
      return res.json({
        status: "INVALID",
        reason: "NOT_FOUND",
        message: "Serial not found. Possible counterfeit."
      });
    }

    // 3. Verify cryptographic hash (anti-tamper)
    const hashValid = verifyHash(
      serial.serialNumber,
      serial.productionDate,
      serial.productCode,
      serial.hashValue
    );

    if (!hashValid) {
      return res.json({
        status: "INVALID",
        reason: "HASH_MISMATCH",
        message: "Hash verification failed. Label data may be tampered."
      });
    }

    // Optional: verify short verification code if provided
    if (verificationCode && verificationCode !== serial.verificationCode) {
      return res.json({
        status: "INVALID",
        reason: "VERIFICATION_CODE",
        message: "Verification code mismatch. Possible fake label."
      });
    }

    // 4. Log this scan
    await ScanLog.create({
      serial: serial._id,
      location
    });

    // 5. Duplicate detection
    const scans = await ScanLog.find({ serial: serial._id }).sort({ scannedAt: 1 });

    const scanCount = scans.length;

    if (scanCount > 1) {
      // 6. Location-based anomaly detection
      const locations = scans.map(s => s.location).filter(Boolean);
      const uniqueLocations = [...new Set(locations)];

      if (uniqueLocations.length > 1) {
        return res.json({
          status: "SUSPECT",
          reason: "DUPLICATE_DIFFERENT_LOCATION",
          message: "Serial scanned multiple times from different locations",
          scanCount,
          locations: uniqueLocations
        });
      }

      return res.json({
        status: "SUSPECT",
        reason: "DUPLICATE",
        message: "Serial scanned multiple times",
        scanCount
      });
    }

    // 7. First valid scan
    res.json({
      status: "VALID",
      message: "Serial is valid and authentic",
      productCode: serial.productCode,
      level: serial.level,
      verificationCode: serial.verificationCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error during scan and verify",
      error: err.message
    });
  }
}
module.exports = { scanAndVerify };


// ------------------------------
// Hierarchy Verification API
// ------------------------------
async function verifyHierarchy(req, res) {
  try {
    const { childSerial, parentSerial } = req.body;

    if (!childSerial || !parentSerial) {
      return res.status(400).json({
        message: "childSerial and parentSerial are required"
      });
    }

    // 1. Find child and parent serial documents
    const child = await Serial.findOne({ serialNumber: childSerial });
    const parent = await Serial.findOne({ serialNumber: parentSerial });

    if (!child || !parent) {
      return res.status(404).json({
        message: "Child or parent serial not found"
      });
    }

    // 2. Check aggregation relationship
    const link = await Aggregation.findOne({
      parent: parent._id,
      child: child._id
    });

    if (!link) {
      return res.json({
        valid: false,
        message: "Hierarchy INVALID: unit does NOT belong to this package"
      });
    }

    // 3. Valid hierarchy
    res.json({
      valid: true,
      message: "Hierarchy VERIFIED: unit belongs to this package",
      child: childSerial,
      parent: parentSerial,
      childLevel: child.level,
      parentLevel: parent.level
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error verifying hierarchy",
      error: err.message
    });
  }
}

module.exports = {
  scanAndVerify,
  verifyHierarchy
};

