const getLineage = (datastore, ref, key = 'parent') =>
  ref
    ? [ref].concat(getLineage(datastore, datastore.findRef(ref)[key], key))
    : [];

module.exports = getLineage;
