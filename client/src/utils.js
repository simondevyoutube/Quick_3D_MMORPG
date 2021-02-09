export const utils = (function() {
  return {
    DictIntersection: function(dictA, dictB) {
      const intersection = {};
      for (let k in dictB) {
        if (k in dictA) {
          intersection[k] = dictA[k];
        }
      }
      return intersection
    },

    DictDifference: function(dictA, dictB) {
      const diff = {...dictA};
      for (let k in dictB) {
        delete diff[k];
      }
      return diff;
    }
  };
})();
