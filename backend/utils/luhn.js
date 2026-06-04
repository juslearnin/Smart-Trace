function calculateLuhn(number) {
  const digits = number.split("").map(d => {
    if (isNaN(d)) throw new Error("Non-numeric digit in Luhn input");
    return parseInt(d);
  });

  for (let i = digits.length - 2; i >= 0; i -= 2) {
    let doubled = digits[i] * 2;
    if (doubled > 9) doubled -= 9;
    digits[i] = doubled;
  }

  const sum = digits.reduce((a, b) => a + b, 0);
  return (10 - (sum % 10)) % 10;
}

function validateLuhn(fullNumber) {
  if (typeof fullNumber !== "string" && typeof fullNumber !== "number") {
    return false;
  }

  const clean = String(fullNumber).trim();
  if (!/^\d{2,}$/.test(clean)) {
    return false;
  }

  const base = clean.slice(0, -1);
  const givenDigit = parseInt(clean.slice(-1));

  const expectedDigit = calculateLuhn(base);

  return givenDigit === expectedDigit;
}

function calculateGs1Mod10(number) {
  if (typeof number !== "string" && typeof number !== "number") {
    throw new Error("GS1 input must be numeric");
  }

  const clean = String(number).trim();
  if (!/^\d+$/.test(clean)) {
    throw new Error("Non-numeric digit in GS1 input");
  }

  let sum = 0;
  let weight = 3;

  for (let i = clean.length - 1; i >= 0; i--) {
    sum += Number(clean[i]) * weight;
    weight = weight === 3 ? 1 : 3;
  }

  return (10 - (sum % 10)) % 10;
}

function validateGs1Mod10(fullNumber) {
  if (typeof fullNumber !== "string" && typeof fullNumber !== "number") {
    return false;
  }

  const clean = String(fullNumber).trim();
  if (!/^\d{2,}$/.test(clean)) {
    return false;
  }

  const base = clean.slice(0, -1);
  const givenDigit = Number(clean.slice(-1));

  return givenDigit === calculateGs1Mod10(base);
}

function validateCheckDigit(fullNumber, algorithm = "luhn") {
  return algorithm === "gs1" ? validateGs1Mod10(fullNumber) : validateLuhn(fullNumber);
}

function validateAnyCheckDigit(fullNumber) {
  return validateLuhn(fullNumber) || validateGs1Mod10(fullNumber);
}

module.exports = {
  calculateLuhn,
  validateLuhn,
  calculateGs1Mod10,
  validateGs1Mod10,
  validateCheckDigit,
  validateAnyCheckDigit
};
