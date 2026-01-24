const Unit = require('../models/unit');
const Batch = require('../models/batch');
const Luhn = require('../util/luhn');
const CryptoUtil = require('../util/crypto');

exports.postGenerateBatch = async (req, res) => {
    const { productName, productCode, companyPrefix, expiryDate, uPerC, cPerP, palletQty } = req.body;
    
    try {
        const startTime = Date.now();
        // 1. Create Batch for Decommissioning/Recall Support [cite: 48]
        const newBatch = await new Batch({
            batchId: `BCH-${Date.now()}`,
            productName,
            productCode,
            expiryDate: new Date(expiryDate)
        }).save();

        for (let p = 0; p < palletQty; p++) {
            // 2. Tertiary Level (Pallet) - GS1 SSCC [cite: 12]
            const pSerial = `SSCC-${companyPrefix}-${Date.now()}-P${p}`;
            const pHash = CryptoUtil.generateHash(pSerial, Date.now(), productCode);
            const pallet = await new Unit({
                serialNumber: pSerial,
                type: 'TERTIARY',
                batchId: newBatch._id,
                verificationHash: pHash,
                publicVerificationCode: CryptoUtil.getPublicCode(pHash)
            }).save();

            for (let c = 0; c < cPerP; c++) {
                // 3. Secondary Level (Carton) [cite: 14, 18]
                const cSerial = `${companyPrefix}${Date.now()}C${p}${c}`;
                const cHash = CryptoUtil.generateHash(cSerial, Date.now(), productCode);
                const carton = await new Unit({
                    serialNumber: cSerial,
                    type: 'SECONDARY',
                    parentId: pallet._id, // Hierarchy linking [cite: 21]
                    batchId: newBatch._id,
                    verificationHash: cHash,
                    publicVerificationCode: CryptoUtil.getPublicCode(cHash)
                }).save();

                let unitBatch = [];
                for (let u = 0; u < uPerC; u++) {
                    // 4. Primary Level (Unit) [cite: 14, 18]
                    const uPayload = `${companyPrefix}${Date.now()}${p}${c}${u}`;
                    const uSerial = `${uPayload}${Luhn.calculate(uPayload)}`; // Luhn Check Digit [cite: 14]
                    const uHash = CryptoUtil.generateHash(uSerial, Date.now(), productCode);
                    
                    unitBatch.push({
                        serialNumber: uSerial,
                        type: 'PRIMARY',
                        parentId: carton._id,
                        batchId: newBatch._id,
                        verificationHash: uHash,
                        publicVerificationCode: CryptoUtil.getPublicCode(uHash)
                    });
                }
                // Performance Requirement: Bulk insert 10k+ < 5s [cite: 50]
                await Unit.insertMany(unitBatch);
            }
        }
        const duration = (Date.now() - startTime) / 1000;
        res.render('admin/dashboard', { pageTitle: 'Success', message: `Generated in ${duration}s` });
    } catch (err) {
        res.status(500).send(err.message);
    }
};