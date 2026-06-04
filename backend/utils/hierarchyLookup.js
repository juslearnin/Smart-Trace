function buildParentLookup(links) {
  const parentByChild = new Map();

  for (const link of links) {
    parentByChild.set(link.child, link.parent);
  }

  return parentByChild;
}

function traceHierarchy(startSerial, parentByChild) {
  const path = [];
  let current = startSerial;

  while (parentByChild.has(current)) {
    const parent = parentByChild.get(current);
    path.push(parent);
    current = parent;
  }

  return path;
}

function verifyDirectParent(childSerial, parentSerial, parentByChild) {
  return parentByChild.get(childSerial) === parentSerial;
}

module.exports = {
  buildParentLookup,
  traceHierarchy,
  verifyDirectParent
};
