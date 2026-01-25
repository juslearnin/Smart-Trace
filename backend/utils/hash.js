const crypto = require("crypto");
const SECRET_SALT = "SMARTTRACE_SECRET_2026";

function generateHash(serialNumber, productionDate, productCode) {
  const ts = new Date(productionDate).getTime();
  const data = `${serialNumber}|${ts}|${productCode}|${SECRET_SALT}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}

function verifyHash(serialNumber, productionDate, productCode, hashValue) {
  const expected = generateHash(serialNumber, productionDate, productCode);
  return expected === hashValue;
}

module.exports = { generateHash, verifyHash };
