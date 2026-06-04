const Serial = require("../models/Serial");
const ScanLog = require("../models/ScanLog");
const { isDbConnected } = require("../utils/dbState");
const memoryStore = require("../utils/memoryStore");

/**
 * GET /admin/stats
 * Returns system-level dashboard statistics
 */
async function getAdminStats(req, res) {
  try {
    if (!isDbConnected()) {
      return res.json({
        totalSerials: memoryStore.countSerials(),
        activeSerials: memoryStore.countSerials({ status: "active" }),
        decommissionedSerials: memoryStore.countSerials({ status: "decommissioned" }),
        totalScans: memoryStore.countScans(),
        validScans: memoryStore.countScans({ status: "VALID" }),
        suspectScans: memoryStore.countScans({ status: "SUSPECT" }),
        invalidScans: memoryStore.countScans({ status: "INVALID" }),
        recentScans: memoryStore.recentScans(10),
        storage: "memory"
      });
    }

    // Serial counts
    const totalSerials = await Serial.countDocuments();
    const activeSerials = await Serial.countDocuments({ status: "active" });
    const decommissionedSerials = await Serial.countDocuments({ status: "decommissioned" });

    // Scan counts by status
    const totalScans = await ScanLog.countDocuments();
    const validScans = await ScanLog.countDocuments({ status: "VALID" });
    const suspectScans = await ScanLog.countDocuments({ status: "SUSPECT" });
    const invalidScans = await ScanLog.countDocuments({ status: "INVALID" });

    // Recent scans (last 10)
    const recentScanLogs = await ScanLog.find({ serial: { $ne: null } })
      .sort({ scannedAt: -1 })
      .limit(10)
      .populate("serial", "serialNumber");

    const recentScans = recentScanLogs.map(log => ({
      serialNumber: log.serial.serialNumber,
      status: log.status,
      location: log.location,
      scannedAt: log.scannedAt
    }));

    res.json({
      totalSerials,
      activeSerials,
      decommissionedSerials,

      totalScans,
      validScans,
      suspectScans,
      invalidScans,

      recentScans
    });

  } catch (err) {
    console.error("Error fetching admin stats:", err);
    res.status(500).json({
      message: "Failed to fetch admin statistics",
      error: err.message,
    });
  }
}

module.exports = {
  getAdminStats,
};
