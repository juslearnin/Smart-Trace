const { generateSerial } = require("./serialGenerator");
const { generateSSCC } = require("./ssccGenerator");
const { generateHash } = require("./hash");

function generateLabelRecords({ companyPrefix, productCode, level, quantity, productionDate = new Date() }) {
  if (!companyPrefix || !productCode || !level || !quantity) {
    throw new Error("companyPrefix, productCode, level, and quantity are required");
  }

  if (!["primary", "secondary", "tertiary"].includes(level)) {
    throw new Error("level must be primary, secondary, or tertiary");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("quantity must be a positive integer");
  }

  const labels = [];
  const checkDigitAlgorithm = level === "tertiary" ? "gs1" : "luhn";

  for (let i = 0; i < quantity; i++) {
    const result = level === "tertiary"
      ? generateSSCC(companyPrefix)
      : generateSerial(companyPrefix);
    const serialNumber = level === "tertiary" ? result.sscc : result.serialNumber;
    const hashValue = generateHash(serialNumber, productionDate, productCode);

    labels.push({
      serialNumber,
      level,
      productCode,
      companyPrefix: String(companyPrefix),
      productionDate,
      checkDigit: result.checkDigit,
      checkDigitAlgorithm,
      hashValue,
      verificationCode: hashValue.slice(0, 8),
      status: "active"
    });
  }

  return labels;
}

module.exports = { generateLabelRecords };
