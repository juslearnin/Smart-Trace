const QRCode = require('qrcode');

module.exports = class QRUtil {
  static async generateQR(data) {
    try {
      return await QRCode.toDataURL(data);
    } catch (err) {
      console.error(err);
      return null;
    }
  }
};