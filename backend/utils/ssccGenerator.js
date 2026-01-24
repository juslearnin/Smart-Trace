const { calculateLuhn } = require("./luhn");

function generateSSCC(companyPrefix) {
  const extensionDigit = "3";  // packaging indicator
  const serialRef = Math.floor(Math.random() * 1e10).toString().padStart(10, "0");

  const base = extensionDigit + companyPrefix + serialRef;
  const checkDigit = calculateLuhn(base);

  return {
    sscc: base + checkDigit,
    checkDigit
  };
}

module.exports = { generateSSCC };
