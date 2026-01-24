const Unit = require('../models/unit');
const Batch = require('../models/batch');
const Luhn = require('../util/luhn');
const CryptoUtil = require('../util/crypto');

exports.postGenerateBatch = async (req, res, next) => {
  const { productName, productCode, quantity, expiryDate, companyPrefix } = req.body;
  try {
    const startTime = Date.now();
    
    // 1. Create Batch
    const newBatch = new Batch({
      batchId: `BCH-${Date.now()}`,
      productName,
      productCode,
      expiryDate: new Date(expiryDate)
    });
    await newBatch.save();

    // 2. Generate Units (Bulk Optimized)
    const unitsToInsert = [];
    const timestamp = Date.now();

    for (let i = 0; i < quantity; i++) {
      const sequence = i.toString().padStart(5, '0');
      const payload = `${companyPrefix}${timestamp}${sequence}`;
      const checkDigit = Luhn.calculate(payload);
      const serialNumber = `${payload}${checkDigit}`;
      
      const hash = CryptoUtil.generateHash(serialNumber, timestamp, productCode);
      
      unitsToInsert.push({
        serialNumber,
        type: 'PRIMARY',
        batchId: newBatch._id,
        verificationHash: hash,
        publicVerificationCode: CryptoUtil.getPublicCode(hash),
        status: 'VALID'
      });
    }

    await Unit.insertMany(unitsToInsert);
    const duration = (Date.now() - startTime) / 1000;
    
    // Respond with JSON for now (until we build the UI View)
    res.status(201).json({ 
      message: 'Batch Created', 
      count: quantity, 
      time: duration 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation Failed' });
  }
};