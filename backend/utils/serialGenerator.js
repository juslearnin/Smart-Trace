const { calculateLuhn } = require("./luhn");

let globalCounter = 0;

function generateSerial(companyPrefix) {
  const timestamp = Date.now().toString();
  const counter = (globalCounter++ % 100000).toString().padStart(5, "0");

  const base = companyPrefix + timestamp + counter;
  const checkDigit = calculateLuhn(base);

  return {
    serialNumber: base + checkDigit,
    checkDigit
  };
}

module.exports = { generateSerial };
