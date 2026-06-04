const { validateCheckDigit } = require("./luhn");
const { verifyHash } = require("./hash");

function getAlgorithm(label) {
  return label.checkDigitAlgorithm || (label.level === "tertiary" ? "gs1" : "luhn");
}

function verifyStoredLabel(label, submitted = {}) {
  if (!label || !label.serialNumber) {
    return {
      valid: false,
      reason: "NOT_FOUND",
      message: "Serial not found. Possible counterfeit."
    };
  }

  const serialNumber = submitted.serialNumber || label.serialNumber;
  const algorithm = getAlgorithm(label);

  if (!validateCheckDigit(serialNumber, algorithm)) {
    return {
      valid: false,
      reason: "CHECK_DIGIT",
      message: "Check digit invalid. Possible tampering."
    };
  }

  if (serialNumber !== label.serialNumber) {
    return {
      valid: false,
      reason: "SERIAL_MISMATCH",
      message: "Submitted serial does not match the stored label."
    };
  }

  if (!verifyHash(label.serialNumber, label.productionDate, label.productCode, label.hashValue)) {
    return {
      valid: false,
      reason: "HASH_MISMATCH",
      message: "Hash verification failed. Label data may be tampered."
    };
  }

  if (submitted.verificationCode && submitted.verificationCode !== label.verificationCode) {
    return {
      valid: false,
      reason: "VERIFICATION_CODE",
      message: "Verification code mismatch. Possible fake label."
    };
  }

  return {
    valid: true,
    reason: null,
    message: "Serial is valid and authentic"
  };
}

module.exports = { verifyStoredLabel };
