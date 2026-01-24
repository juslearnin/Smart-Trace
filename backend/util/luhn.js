module.exports = class Luhn {
  static calculate(input) {
    const digits = input.split('').map(Number);
    let sum = 0;
    let isSecond = true;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = digits[i];
      if (isSecond) {
        d = d * 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      isSecond = !isSecond;
    }
    return (sum * 9) % 10;
  }
};