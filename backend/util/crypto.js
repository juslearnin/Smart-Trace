const crypto = require('crypto');

module.exports = class CryptoUtil {
  static generateHash(serial, date, productCode) {
    const salt = process.env.SECRET_SALT;
    const data = `${serial}|${date}|${productCode}|${salt}`;
    return crypto.createHmac('sha256', salt).update(data).digest('hex');
  }
  
  static getPublicCode(fullHash) {
    return fullHash.substring(0, 8).toUpperCase();
  }
};