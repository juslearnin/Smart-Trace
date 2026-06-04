const { calculateLuhn } = require("./luhn");

let globalCounter = 0;
let lastTimestamp = 0;

function assertCompanyPrefix(companyPrefix) {
  if (typeof companyPrefix !== "string" && typeof companyPrefix !== "number") {
    throw new Error("companyPrefix is required");
  }

  const cleanPrefix = String(companyPrefix).trim();
  if (!/^\d{6,12}$/.test(cleanPrefix)) {
    throw new Error("companyPrefix must be 6 to 12 numeric digits");
  }

  return cleanPrefix;
}

function nextSerialParts() {
  const now = Date.now();
  const maxCounter = 1000000;

  if (now > lastTimestamp) {
    lastTimestamp = now;
    globalCounter = 0;
  } else {
    globalCounter += 1;

    if (globalCounter >= maxCounter) {
      lastTimestamp += 1;
      globalCounter = 0;
    }
  }

  return {
    timestamp: String(lastTimestamp),
    counter: String(globalCounter).padStart(6, "0")
  };
}

function generateSerial(companyPrefix) {
  const prefix = assertCompanyPrefix(companyPrefix);
  const { timestamp, counter } = nextSerialParts();

  const base = prefix + timestamp + counter;
  const checkDigit = calculateLuhn(base);

  return {
    serialNumber: base + checkDigit,
    checkDigit
  };
}

module.exports = { generateSerial };
