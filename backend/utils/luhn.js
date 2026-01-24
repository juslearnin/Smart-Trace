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
  // Remove spaces just in case
  const clean = fullNumber.trim();

  const base = clean.slice(0, -1);
  const givenDigit = parseInt(clean.slice(-1));

  const expectedDigit = calculateLuhn(base);

  return givenDigit === expectedDigit;
}

module.exports = { calculateLuhn, validateLuhn };
