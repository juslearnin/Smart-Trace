const test = require("node:test");
const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");

const Aggregation = require("../models/Aggregation");
const { generateLabelRecords } = require("../utils/labelBatchGenerator");
const { validateLuhn, validateGs1Mod10 } = require("../utils/luhn");
const { verifyStoredLabel } = require("../utils/labelVerification");
const {
  buildParentLookup,
  traceHierarchy,
  verifyDirectParent
} = require("../utils/hierarchyLookup");

function mutateLastDigit(serialNumber) {
  const prefix = serialNumber.slice(0, -1);
  const last = Number(serialNumber.slice(-1));
  return `${prefix}${(last + 1) % 10}`;
}

test("generates 10,000 primary labels in under 5 seconds with zero duplicates", () => {
  const started = performance.now();
  const labels = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "PCM001",
    level: "primary",
    quantity: 10000
  });
  const elapsedMs = performance.now() - started;

  const serials = labels.map(label => label.serialNumber);
  assert.equal(labels.length, 10000);
  assert.equal(new Set(serials).size, 10000);
  assert.ok(elapsedMs < 5000, `generation took ${elapsedMs.toFixed(2)}ms`);
});

test("generates GS1-compliant SSCCs for tertiary packaging", () => {
  const labels = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "PALLET001",
    level: "tertiary",
    quantity: 10000
  });

  assert.equal(new Set(labels.map(label => label.serialNumber)).size, 10000);

  for (const label of labels) {
    assert.equal(label.serialNumber.length, 18);
    assert.match(label.serialNumber, /^\d{18}$/);
    assert.equal(label.serialNumber.slice(1, 7), "890123");
    assert.equal(label.checkDigitAlgorithm, "gs1");
    assert.equal(validateGs1Mod10(label.serialNumber), true);
  }

  const maxPrefixLabels = generateLabelRecords({
    companyPrefix: "123456789012",
    productCode: "PALLET999",
    level: "tertiary",
    quantity: 10
  });

  for (const label of maxPrefixLabels) {
    assert.equal(label.serialNumber.length, 18);
    assert.equal(validateGs1Mod10(label.serialNumber), true);
  }
});

test("validates every generated check digit at 100% accuracy", () => {
  const primaryLabels = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "UNIT001",
    level: "primary",
    quantity: 5000
  });
  const secondaryLabels = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "CARTON001",
    level: "secondary",
    quantity: 5000
  });
  const tertiaryLabels = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "PALLET001",
    level: "tertiary",
    quantity: 5000
  });

  for (const label of primaryLabels.concat(secondaryLabels)) {
    assert.equal(label.checkDigitAlgorithm, "luhn");
    assert.equal(validateLuhn(label.serialNumber), true);
  }

  for (const label of tertiaryLabels) {
    assert.equal(validateGs1Mod10(label.serialNumber), true);
  }
});

test("detects tampered and fake labels during verification", () => {
  const [label] = generateLabelRecords({
    companyPrefix: "890123",
    productCode: "UNIT001",
    level: "primary",
    quantity: 1
  });

  assert.deepEqual(verifyStoredLabel(null), {
    valid: false,
    reason: "NOT_FOUND",
    message: "Serial not found. Possible counterfeit."
  });

  const badCheckDigit = verifyStoredLabel(label, {
    serialNumber: mutateLastDigit(label.serialNumber)
  });
  assert.equal(badCheckDigit.valid, false);
  assert.equal(badCheckDigit.reason, "CHECK_DIGIT");

  const tamperedProduct = verifyStoredLabel({
    ...label,
    productCode: "UNIT999"
  });
  assert.equal(tamperedProduct.valid, false);
  assert.equal(tamperedProduct.reason, "HASH_MISMATCH");

  const wrongCode = verifyStoredLabel(label, {
    verificationCode: "BADCODE1"
  });
  assert.equal(wrongCode.valid, false);
  assert.equal(wrongCode.reason, "VERIFICATION_CODE");
});

test("hierarchy lookup completes under 100ms for 10,000 relationships", () => {
  const links = [];

  for (let i = 0; i < 10000; i++) {
    links.push({
      child: `P${i}`,
      parent: `S${Math.floor(i / 10)}`
    });
  }

  for (let i = 0; i < 1000; i++) {
    links.push({
      child: `S${i}`,
      parent: `T${Math.floor(i / 10)}`
    });
  }

  const lookup = buildParentLookup(links);
  const started = performance.now();
  const path = traceHierarchy("P9876", lookup);
  const elapsedMs = performance.now() - started;

  assert.deepEqual(path, ["S987", "T98"]);
  assert.ok(elapsedMs < 100, `hierarchy lookup took ${elapsedMs.toFixed(2)}ms`);
});

test("primary to secondary to tertiary relationship correctness", () => {
  const lookup = buildParentLookup([
    { child: "PRIMARY-001", parent: "SECONDARY-001" },
    { child: "SECONDARY-001", parent: "TERTIARY-001" }
  ]);

  assert.equal(verifyDirectParent("PRIMARY-001", "SECONDARY-001", lookup), true);
  assert.equal(verifyDirectParent("SECONDARY-001", "TERTIARY-001", lookup), true);
  assert.equal(verifyDirectParent("PRIMARY-001", "TERTIARY-001", lookup), false);
  assert.deepEqual(traceHierarchy("PRIMARY-001", lookup), ["SECONDARY-001", "TERTIARY-001"]);
});

test("aggregation model has indexes needed for hierarchy queries", () => {
  const indexes = Aggregation.schema.indexes().map(([fields]) => fields);

  assert.ok(indexes.some(fields => fields.parent === 1 && fields.child === 1));
  assert.ok(indexes.some(fields => fields.child === 1));
  assert.ok(indexes.some(fields => fields.parent === 1));
});
