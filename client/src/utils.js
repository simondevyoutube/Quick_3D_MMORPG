export function DictIntersection(dictA, dictB) {
  const intersection = {};
  for (let k in dictB) {
    if (k in dictA) {
      intersection[k] = dictA[k];
    }
  }
  return intersection;
}

export function DictDifference(dictA, dictB) {
  const diff = { ...dictA };
  for (let k in dictB) {
    delete diff[k];
  }
  return diff;
}
