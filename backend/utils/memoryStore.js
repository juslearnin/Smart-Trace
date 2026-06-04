const crypto = require("crypto");

const serials = new Map();
const scans = [];
const aggregations = [];

function withId(record) {
  return {
    _id: record._id || crypto.randomUUID(),
    ...record
  };
}

function insertSerials(records) {
  for (const record of records) {
    if (serials.has(record.serialNumber)) {
      const error = new Error(`Duplicate serial number: ${record.serialNumber}`);
      error.code = 11000;
      throw error;
    }
  }

  const inserted = records.map(record => {
    const next = withId(record);
    serials.set(next.serialNumber, next);
    return next;
  });

  return inserted;
}

function createSerial(record) {
  return insertSerials([record])[0];
}

function findSerial(serialNumber) {
  return serials.get(serialNumber) || null;
}

function countSerials(filter = {}) {
  return findSerials(filter).length;
}

function findSerials(filter = {}) {
  return Array.from(serials.values()).filter(serial => {
    if (filter.level && serial.level !== filter.level) return false;
    if (filter.status && serial.status !== filter.status) return false;
    if (filter._id?.$nin?.includes(serial._id)) return false;
    return true;
  });
}

function updateSerials(serialNumbers, changes) {
  let modified = 0;

  for (const serialNumber of serialNumbers) {
    const serial = serials.get(serialNumber);
    if (serial) {
      Object.assign(serial, changes);
      modified += 1;
    }
  }

  return { modifiedCount: modified };
}

function insertAggregations(links) {
  for (const link of links) {
    const exists = aggregations.some(item => item.parent === link.parent && item.child === link.child);
    if (!exists) aggregations.push({ ...link, _id: crypto.randomUUID(), createdAt: new Date() });
  }
}

function findAggregation(filter = {}) {
  return aggregations.find(link => {
    if (filter.parent && link.parent !== filter.parent) return false;
    if (filter.child && link.child !== filter.child) return false;
    return true;
  }) || null;
}

function childIdsInAggregations() {
  return [...new Set(aggregations.map(link => link.child))];
}

function createScan(record) {
  const scan = {
    _id: crypto.randomUUID(),
    scannedAt: new Date(),
    ...record
  };
  scans.push(scan);
  return scan;
}

function findScansBySerial(serialId) {
  return scans
    .filter(scan => scan.serial === serialId)
    .sort((a, b) => new Date(a.scannedAt) - new Date(b.scannedAt));
}

function countScans(filter = {}) {
  return scans.filter(scan => !filter.status || scan.status === filter.status).length;
}

function recentScans(limit = 10) {
  return scans
    .filter(scan => scan.serial)
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
    .slice(0, limit)
    .map(scan => {
      const serial = Array.from(serials.values()).find(item => item._id === scan.serial);
      return {
        serialNumber: serial?.serialNumber || "Unknown",
        status: scan.status,
        location: scan.location,
        scannedAt: scan.scannedAt
      };
    });
}

module.exports = {
  insertSerials,
  createSerial,
  findSerial,
  findSerials,
  countSerials,
  updateSerials,
  insertAggregations,
  findAggregation,
  childIdsInAggregations,
  createScan,
  findScansBySerial,
  countScans,
  recentScans
};
