const Serial = require("../models/Serial");
const ScanLog = require("../models/ScanLog");
const { validateAnyCheckDigit, validateCheckDigit } = require("../utils/luhn");
const Aggregation = require("../models/Aggregation");
const { verifyHash } = require("../utils/hash");
const { isDbConnected } = require("../utils/dbState");
const memoryStore = require("../utils/memoryStore");


async function scanAndVerify(req, res) {
  try {
    const { serialNumber, location, verificationCode } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ message: "serialNumber is required" });
    }

    let status = "INVALID";
    let reason = null;
    let message = null;

    // 1. Check digit validation
    const checkValid = validateAnyCheckDigit(serialNumber);
    if (!checkValid) {
      reason = "CHECK_DIGIT";
      message = "Check digit invalid. Possible tampering.";
      return res.json({ status, reason, message });
    }

    // 2. Check if serial exists
    let serial = isDbConnected()
      ? await Serial.findOne({ serialNumber })
      : memoryStore.findSerial(serialNumber);

    // ========================================================
    // GLOBAL HIERARCHY DECOMMISSION CHECK & DESTROY
    // ========================================================
    if (serial) {
      let isDecommissionedByParent = false;

      // Check if this item belongs to a parent container that was decommissioned
      if (isDbConnected()) {
        const aggregationLink = await Aggregation.findOne({ child: serial._id });
        if (aggregationLink) {
          const parentSerial = await Serial.findById(aggregationLink.parent);
          if (parentSerial) {
            const parentStatus = String(parentSerial.status || "").toUpperCase();
            if (parentStatus === "DECOMMISSIONED" || parentSerial.isDecommissioned === true || parentSerial.decommissioned === true) {
              isDecommissionedByParent = true;
            }
          }
        }
      }

      // Read current statuses safely
      const serialStatus = String(serial.status || "").toUpperCase();
      
      // Look through logs for any decommissioning footprint
      const logs = isDbConnected()
        ? await ScanLog.find({ serial: serial._id })
        : memoryStore.findScansBySerial(serial._id);
      const hasDecommissionLog = logs.some(log => String(log.status).toUpperCase() === "DECOMMISSIONED");

      // Master condition: Is this item or its container decommissioned?
      const triggerWipe = (
        serialStatus === "DECOMMISSIONED" || 
        serial.isDecommissioned === true || 
        serial.decommissioned === true ||
        hasDecommissionLog ||
        isDecommissionedByParent ||
        (serialStatus !== "ACTIVE" && serialStatus !== "VALID" && serialStatus !== "")
      );

      if (triggerWipe) {
        // Nuke it completely out of existence across all collections
        if (isDbConnected()) {
          await Serial.deleteOne({ _id: serial._id });
          await ScanLog.deleteMany({ serial: serial._id });
          await Aggregation.deleteMany({ $or: [{ child: serial._id }, { parent: serial._id }] });
        }
        
        if (memoryStore) {
          if (typeof memoryStore.deleteSerial === "function") memoryStore.deleteSerial(serialNumber);
          if (memoryStore.serials && Array.isArray(memoryStore.serials)) {
            memoryStore.serials = memoryStore.serials.filter(s => s.serialNumber !== serialNumber);
          }
        }

        // Drop variable to null so it forces a "does not exist" response
        serial = null;
      }
    }

    if (!serial) {
      reason = "NOT_FOUND";
      message = "Serial not found. Possible counterfeit.";
      return res.json({ status, reason, message });
    }

    const algorithm = serial.checkDigitAlgorithm || (serial.level === "tertiary" ? "gs1" : "luhn");
    if (!validateCheckDigit(serialNumber, algorithm)) {
      reason = "CHECK_DIGIT";
      message = "Check digit does not match the stored label type.";

      if (isDbConnected()) {
        await ScanLog.create({ serial: serial._id, status, location });
      } else {
        memoryStore.createScan({ serial: serial._id, status, location });
      }

      return res.json({ status, reason, message });
    }

    // 3. Verify cryptographic hash (anti-tamper)
    const hashValid = verifyHash(
      serial.serialNumber,
      serial.productionDate,
      serial.productCode,
      serial.hashValue
    );

    if (!hashValid) {
      reason = "HASH_MISMATCH";
      message = "Hash verification failed. Label data may be tampered.";

      if (isDbConnected()) {
        await ScanLog.create({ serial: serial._id, status, location });
      } else {
        memoryStore.createScan({ serial: serial._id, status, location });
      }

      return res.json({ status, reason, message });
    }

    // Optional: verify short verification code if provided
    if (verificationCode && verificationCode !== serial.verificationCode) {
      reason = "VERIFICATION_CODE";
      message = "Verification code mismatch. Possible fake label.";

      if (isDbConnected()) {
        await ScanLog.create({ serial: serial._id, status, location });
      } else {
        memoryStore.createScan({ serial: serial._id, status, location });
      }

      return res.json({ status, reason, message });
    }

    // 4. Check previous scans (before inserting this one)
    const previousScans = isDbConnected()
      ? await ScanLog.find({ serial: serial._id }).sort({ scannedAt: 1 })
      : memoryStore.findScansBySerial(serial._id);
    const previousCount = previousScans.length;

    // 5. Decide final status
    if (previousCount > 0) {
      // Duplicate case
      const locations = previousScans.map(s => s.location).filter(Boolean);
      const uniqueLocations = [...new Set(locations)];

      if (location) uniqueLocations.push(location);

      const finalUniqueLocations = [...new Set(uniqueLocations)];

      status = "SUSPECT";

      if (finalUniqueLocations.length > 1) {
        reason = "DUPLICATE_DIFFERENT_LOCATION";
        message = "Serial scanned multiple times from different locations";
      } else {
        reason = "DUPLICATE";
        message = "Serial scanned multiple times";
      }

      // Save SUSPECT scan
      if (isDbConnected()) {
        await ScanLog.create({ serial: serial._id, status, location });
      } else {
        memoryStore.createScan({ serial: serial._id, status, location });
      }

      return res.json({
        status,
        reason,
        message,
        scanCount: previousCount + 1,
        locations: finalUniqueLocations,
      });
    }

    // 6. First valid scan
    status = "VALID";
    message = "Serial is valid and authentic";

    // Save VALID scan
    if (isDbConnected()) {
      await ScanLog.create({ serial: serial._id, status, location });
    } else {
      memoryStore.createScan({ serial: serial._id, status, location });
    }

    res.json({
      status,
      message,
      productCode: serial.productCode,
      level: serial.level,
      verificationCode: serial.verificationCode,
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
    const child = isDbConnected()
      ? await Serial.findOne({ serialNumber: childSerial })
      : memoryStore.findSerial(childSerial);
    const parent = isDbConnected()
      ? await Serial.findOne({ serialNumber: parentSerial })
      : memoryStore.findSerial(parentSerial);

    if (!child || !parent) {
      return res.json({
        valid: false,
        message: "Child or parent serial not found"
      });
    }

    // 2. Check aggregation relationship
    const link = isDbConnected()
      ? await Aggregation.findOne({ parent: parent._id, child: child._id })
      : memoryStore.findAggregation({ parent: parent._id, child: child._id });

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