const Datastore = require('./lib/Datastore');

const { required, isString, foreignKey } = Datastore;

const createDatastore = () => {
  const datastore = new Datastore();

  datastore.define('language', [
    isString('title'),
    required('title'),
    foreignKey('parent'),
  ]);

  datastore.define('collection', [
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
    foreignKey('collection'),
    foreignKey('definitionSet'),
    required('definitionSet'),
    // TODO: Unique composite key for definitions:
    // Datastore.unique(['language', 'collection', 'definitionSet']),
  ]);

  return datastore;
};

module.exports = createDatastore;
