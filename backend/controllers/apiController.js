const Unit = require('../models/unit');
const GeoUtil = require('../util/geo');

exports.postVerify = async (req, res) => {
    const { serialNumber, lat, lng } = req.body;

    try {
        // Query Requirement: Results in < 100ms [cite: 53]
        const unit = await Unit.findOne({ serialNumber }).populate('batchId').populate('parentId');

        if (!unit || unit.batchId.isDecommissioned) {
            return res.render('shop/result', { status: 'INVALID', message: 'Product not recognized or recalled.' });
        }

        let status = 'VALID';
        const lastScan = unit.scanHistory[unit.scanHistory.length - 1];

        // Innovation: Location-based Anomaly Detection [cite: 45]
        if (lastScan && lat && lng) {
            const distance = GeoUtil.getDistanceFromLatLonInKm(lastScan.location.lat, lastScan.location.lng, lat, lng);
            const timeDiff = (Date.now() - lastScan.timestamp) / (1000 * 60 * 60); // Hours
            
            if (distance > 500 && timeDiff < 1) status = 'SUSPECT'; // Impossible travel speed [cite: 32]
        }

        unit.scanHistory.push({ location: { lat, lng }, status });
        await unit.save();

        res.render('shop/result', { 
            status, 
            unit, 
            pageTitle: 'Verification Result',
            path: unit.parentId ? 'Verified Path Found' : 'Individual Unit' // Traceability Path [cite: 40]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};