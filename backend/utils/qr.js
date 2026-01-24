const QRCode = require("qrcode");

async function generateQRCode(data) {
  const qr = await QRCode.toDataURL(JSON.stringify(data));
  return qr; // base64 image
}

module.exports = { generateQRCode };
