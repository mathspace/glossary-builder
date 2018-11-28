const yaml = require('js-yaml');

const Datastore = require('./lib/Datastore');

const { required, notNull, string, foreignKey } = Datastore;

const createDatastore = data => {
  const datastore = new Datastore();

  datastore.define('language', [
    // title
    required('title'),
    notNull('title'),
    string('title'),
    // parent
    // TODO: Enforce type of 'language'.
    foreignKey('parent'),
    required('parent'),
  ]);

  datastore.define('curriculum', [
    // title
    required('title'),
    notNull('title'),
    string('title'),
    // parent
    // TODO: Enforce type of 'curriculum'.
    foreignKey('parent'),
    required('parent'),
  ]);

  datastore.define('definition-set');

  datastore.define('definition', [
    // title
    required('title'),
    notNull('title'),
    string('title'),
    // body
    required('body'),
    notNull('body'),
    string('body'),
    // language
    required('language'),
    notNull('language'),
    foreignKey('language'),
    // curriculum
    foreignKey('curriculum'),
    required('curriculum'),
    // definitionSet
    required('definitionSet'),
    notNull('definitionSet'),
    foreignKey('definitionSet'),
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
