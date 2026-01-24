const Serial = require("../models/Serial");
const { generateSerial } = require("../utils/serialGenerator");
const { generateSSCC } = require("../utils/ssccGenerator");
const { validateLuhn } = require("../utils/luhn");
const { generateQRCode } = require("../utils/qr");
const { generateHash } = require("../utils/hash");

// ------------------------------
// 1. Batch Generation Controller
// ------------------------------
async function generateBatch(req, res) {
  try {
    const { companyPrefix, productCode, level, quantity } = req.body;

    if (!companyPrefix || !productCode || !level || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const bulk = [];
    const productionDate = new Date();

    for (let i = 0; i < quantity; i++) {
      let result;

      if (level === "tertiary") {
        result = generateSSCC(companyPrefix);
      } else {
        result = generateSerial(companyPrefix);
      }

      const serialNumber = level === "tertiary" ? result.sscc : result.serialNumber;
      const hashValue = generateHash(serialNumber, productionDate, productCode);
const verificationCode = hashValue.slice(0, 8); // first 8 chars


      // Payload embedded inside QR
      const qrPayload = {
        serial: serialNumber,
        productCode,
        level,
        companyPrefix
      };

      const qrCode = await generateQRCode(qrPayload);

      bulk.push({
        serialNumber,
        level,
        productCode,
        companyPrefix,
        productionDate,
        checkDigit: result.checkDigit,
        qrCode,                // <-- QR stored correctly
        hashValue,
        verificationCode,
        status: "active"
      });
    }

    await Serial.insertMany(bulk, { ordered: false });

    res.json({
      message: "Batch generated successfully",
      generated: bulk.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error generating batch",
      error: err.message
    });
  }
}

// --------------------------------
// 2. Check Digit Validation API
// --------------------------------
function validateSerial(req, res) {
  const { serial } = req.params;

  const valid = validateLuhn(serial);

  res.json({
    serial,
    valid
  });
}

// --------------------------------
// 3. Batch Decommissioning API
// --------------------------------
async function decommissionBatch(req, res) {
  try {
    const { serialNumbers } = req.body;

    if (!Array.isArray(serialNumbers) || serialNumbers.length === 0) {
      return res.status(400).json({ message: "serialNumbers must be a non-empty array" });
    }

    const result = await Serial.updateMany(
      { serialNumber: { $in: serialNumbers } },
      { $set: { status: "decommissioned" } }
    );

    res.json({
      message: "Decommissioned successfully",
      modified: result.modifiedCount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error decommissioning batch",
      error: err.message
    });
  }
}

module.exports = {
  generateBatch,
  validateSerial,
  decommissionBatch
};
