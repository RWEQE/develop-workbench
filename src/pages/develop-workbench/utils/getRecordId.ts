export const getRecordId = (() => {
  let recordId = 0;
  return () => {
    return recordId++;
  };
})();
