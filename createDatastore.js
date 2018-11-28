const yaml = require('js-yaml');

const Datastore = require('./lib/Datastore');

const { required, isString, foreignKey } = Datastore;

const createDatastore = (data) => {
  const datastore = new Datastore();

  datastore.define('language', [
    isString('title'),
    required('title'),
    foreignKey('parent'),
  ]);

  datastore.define('curriculum', [
    isString('title'),
    required('title'),
    foreignKey('parent'),
  ]);

  datastore.define('definition-set');

  datastore.define('definition', [
    isString('title'),
    required('title'),
    isString('body'),
    required('body'),
    foreignKey('language'),
    required('language'),
    foreignKey('definitionSet'),
    foreignKey('curriculum'),
    required('definitionSet'),
    // TODO: Unique composite key for definitions:
    // Datastore.unique(['language', 'curriculum', 'definitionSet']),
  ]);

  data
    .reduce((records, x) => records.concat(yaml.safeLoadAll(x)), [])
    .forEach(record => {
      datastore.create(record);
    });

  datastore.validate();

  return datastore;
};

module.exports = createDatastore;
