const Serial = require("../models/Serial");
const { validateAnyCheckDigit } = require("../utils/luhn");
const { generateQRCode } = require("../utils/qr");
const { generateLabelRecords } = require("../utils/labelBatchGenerator");
const { isDbConnected } = require("../utils/dbState");
const memoryStore = require("../utils/memoryStore");

// ------------------------------
// 1. Batch Generation Controller
// ------------------------------
async function generateBatch(req, res) {
  try {
    const { companyPrefix, productCode, level, quantity, includeQr } = req.body;

    if (!companyPrefix || !productCode || !level || !quantity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const productionDate = new Date();
    const bulk = generateLabelRecords({
      companyPrefix,
      productCode,
      level,
      quantity: Number(quantity),
      productionDate
    });

    const shouldGenerateQr = includeQr === true || (includeQr !== false && bulk.length <= 1000);
    if (shouldGenerateQr) {
      await Promise.all(bulk.map(async item => {
        const qrPayload = {
          serialNumber: item.serialNumber,
          productCode,
          level,
          verifyUrl: `http://localhost:3000/scan?serial=${item.serialNumber}`
        };

        item.qrCode = await generateQRCode(qrPayload);
      }));
    }

    if (isDbConnected()) {
      await Serial.insertMany(bulk, { ordered: false });
    } else {
      memoryStore.insertSerials(bulk);
    }
res.json({
  message: "Batch generated successfully",
  generated: bulk.length,
  labels: bulk.map(item => ({
    serialNumber: item.serialNumber,
    qrCode: item.qrCode
  }))
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

  const valid = validateAnyCheckDigit(serial);

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

    const result = isDbConnected()
      ? await Serial.updateMany(
          { serialNumber: { $in: serialNumbers } },
          { $set: { status: "decommissioned" } }
        )
      : memoryStore.updateSerials(serialNumbers, { status: "decommissioned" });

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


