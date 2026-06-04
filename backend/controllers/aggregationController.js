const Serial = require("../models/Serial");
const Aggregation = require("../models/Aggregation");
const { generateSerial } = require("../utils/serialGenerator");
const { generateSSCC } = require("../utils/ssccGenerator");
const { generateHash } = require("../utils/hash");
const { isDbConnected } = require("../utils/dbState");
const memoryStore = require("../utils/memoryStore");

// ------------------------------
// 1. Aggregation API
// ------------------------------
// Example: 10 primary -> 1 secondary
async function aggregateSerials(req, res) {
  try {
    const { childLevel, parentLevel, ratio, companyPrefix, productCode } = req.body;

    if (!childLevel || !parentLevel || !ratio || !companyPrefix || !productCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate ratio
    if (ratio <= 0 || !Number.isInteger(ratio)) {
      return res.status(400).json({ message: "Ratio must be a positive integer" });
    }

    // Validate levels
    const validLevels = ["primary", "secondary", "tertiary"];
    if (!validLevels.includes(childLevel) || !validLevels.includes(parentLevel)) {
      return res.status(400).json({ message: "Invalid level specified" });
    }

    if (childLevel === parentLevel) {
      return res.status(400).json({ message: "Child and parent levels must be different" });
    }

    // 1. Find unassigned child serials (not already aggregated as child)
    const alreadyUsedChildren = isDbConnected()
      ? await Aggregation.find().distinct("child")
      : memoryStore.childIdsInAggregations();

    const children = isDbConnected()
      ? await Serial.find({
          level: childLevel,
          status: "active",
          _id: { $nin: alreadyUsedChildren }
        }).limit(ratio)
      : memoryStore
          .findSerials({ level: childLevel, status: "active", _id: { $nin: alreadyUsedChildren } })
          .slice(0, ratio);

    if (children.length < ratio) {
      return res.status(400).json({
        message: `Not enough unassigned ${childLevel} serials to aggregate`
      });
    }

    // 2. Generate parent serial
    let parentResult;

    if (parentLevel === "tertiary") {
      parentResult = generateSSCC(companyPrefix);
    } else {
      parentResult = generateSerial(companyPrefix);
    }

    if (!parentResult || parentResult.checkDigit === undefined) {
      return res.status(500).json({ message: "Failed to generate parent serial" });
    }

    const parentSerialNumber =
      parentLevel === "tertiary" ? parentResult.sscc : parentResult.serialNumber;
    const checkDigitAlgorithm = parentLevel === "tertiary" ? "gs1" : "luhn";

    // Check if parent serial already exists
    const existingParent = isDbConnected()
      ? await Serial.findOne({ serialNumber: parentSerialNumber })
      : memoryStore.findSerial(parentSerialNumber);
    if (existingParent) {
      return res.status(400).json({ message: "Parent serial number already exists" });
    }

    const productionDate = new Date();
    const hashValue = generateHash(parentSerialNumber, productionDate, productCode);
    const parentPayload = {
      serialNumber: parentSerialNumber,
      level: parentLevel,
      productCode,
      companyPrefix,
      productionDate,
      checkDigit: parentResult.checkDigit,
      checkDigitAlgorithm,
      hashValue,
      verificationCode: hashValue.slice(0, 8),
      status: "active"
    };

    const parentSerial = isDbConnected()
      ? await Serial.create(parentPayload)
      : memoryStore.createSerial(parentPayload);

    // 3. Create parent-child relationships
    const links = children.map(child => ({
      parent: parentSerial._id,
      child: child._id
    }));

    if (isDbConnected()) {
      await Aggregation.insertMany(links);
    } else {
      memoryStore.insertAggregations(links);
    }

    res.json({
      message: "Aggregation successful",
      parent: parentSerial.serialNumber,
      children: children.map(c => c.serialNumber)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error during aggregation",
      error: err.message
    });
  }
}

// ------------------------------
// 2. Trace API (Red Thread)
// ------------------------------
async function traceSerial(req, res) {
  try {
    const { serialNumber } = req.params;

    // Find the serial
    const serial = isDbConnected()
      ? await Serial.findOne({ serialNumber })
      : memoryStore.findSerial(serialNumber);

    if (!serial) {
      return res.status(404).json({ message: "Serial not found" });
    }

    let path = [];
    let current = serial;

    // Go upward until no parent found
    while (true) {
      const link = isDbConnected()
        ? await Aggregation.findOne({ child: current._id }).populate("parent")
        : memoryStore.findAggregation({ child: current._id });

      if (!link) break;
      const parent = isDbConnected()
        ? link.parent
        : Array.from(memoryStore.findSerials()).find(item => item._id === link.parent);
      if (!parent) break;

      path.push({
        level: parent.level,
        serialNumber: parent.serialNumber
      });

      current = parent;
    }

    res.json({
      start: serial.serialNumber,
      level: serial.level,
      tracePath: path   // Primary -> Secondary -> Tertiary
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error tracing serial",
      error: err.message
    });
  }
}

module.exports = {
  aggregateSerials,
  traceSerial
};
