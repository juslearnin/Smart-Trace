const { calculateGs1Mod10 } = require("./luhn");

let ssccCounter = 0;
let lastTimestamp = 0;

function nextMonotonicTimestamp(counterWidth) {
  const now = Date.now();
  const maxCounter = 10 ** counterWidth;

  if (now > lastTimestamp) {
    lastTimestamp = now;
    ssccCounter = 0;
  } else {
    ssccCounter += 1;

    if (ssccCounter >= maxCounter) {
      lastTimestamp += 1;
      ssccCounter = 0;
    }
  }

  return lastTimestamp;
}

function assertCompanyPrefix(companyPrefix) {
  if (typeof companyPrefix !== "string" && typeof companyPrefix !== "number") {
    throw new Error("companyPrefix is required");
  }

  const cleanPrefix = String(companyPrefix).trim();
  if (!/^\d{6,12}$/.test(cleanPrefix)) {
    throw new Error("GS1 companyPrefix must be 6 to 12 numeric digits");
  }

  return cleanPrefix;
}

function generateSerialReference(length) {
  const counterWidth = Math.min(4, length);
  const timestampWidth = length - counterWidth;
  const timestamp = nextMonotonicTimestamp(counterWidth).toString();
  const timestampPart = timestampWidth > 0 ? timestamp.slice(-timestampWidth) : "";
  const counterPart = ssccCounter
    .toString()
    .padStart(counterWidth, "0");

  return timestampPart + counterPart;
}

function generateSSCC(companyPrefix, extensionDigit = "3") {
  const prefix = assertCompanyPrefix(companyPrefix);

  if (!/^\d$/.test(String(extensionDigit))) {
    throw new Error("SSCC extensionDigit must be one numeric digit");
  }

  const serialReferenceLength = 17 - String(extensionDigit).length - prefix.length;
  if (serialReferenceLength <= 0) {
    throw new Error("companyPrefix is too long for an 18-digit SSCC");
  }

  const serialRef = generateSerialReference(serialReferenceLength);
  const base = String(extensionDigit) + prefix + serialRef;
  const checkDigit = calculateGs1Mod10(base);

  return {
    sscc: base + checkDigit,
    checkDigit
  };
}

module.exports = { generateSSCC };
