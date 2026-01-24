const crypto = require("crypto");

const SECRET_SALT = "SMARTTRACE_SECRET_2026"; // move to .env later

function generateHash(serialNumber, productionDate, productCode) {
  const data =
    serialNumber +
    productionDate.toISOString() +
    productCode +
    SECRET_SALT;

  return crypto.createHash("sha256").update(data).digest("hex");
}

function verifyHash(serialNumber, productionDate, productCode, hashValue) {
  const expected = generateHash(serialNumber, productionDate, productCode);
  return expected === hashValue;
}

module.exports = { generateHash, verifyHash };
