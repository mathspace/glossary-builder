const yaml = require('js-yaml');

const datastore = require('./datastore');
const getLineage = require('./getLineage');

const build = data => {
  const result = {};

  data
    .reduce((records, x) => records.concat(yaml.safeLoadAll(x)), [])
    .forEach(record => {
      datastore.create(record);
    });

  datastore.findAll('language').forEach(language => {
    const languageLineage = getLineage(datastore, `language/${language.id}`);
    const collections = datastore.findAll('collection').forEach(collection => {
      const collectionLineage = getLineage(
        datastore,
        `collection/${collection.id}`,
      ).concat([null]);
      const definitionSets = datastore
        .findAll('definition-set')
        .forEach(definitionSet => {
          const fileName = [language.id, collection.id, definitionSet.id].join(
            '/',
          );
          collectionLineage.forEach(searchCollection => {
            if (result[fileName]) return;
            languageLineage.forEach(searchLanguage => {
              if (result[fileName]) return;
              const definition = datastore
                .findAll('definition')
                .find(
                  record =>
                    record.language === searchLanguage &&
                    record.collection === searchCollection &&
                    record.definitionSet ===
                      `definition-set/${definitionSet.id}`,
                );
              if (definition)
                result[fileName] = `${definition.title}\n\n${definition.body}`;
            });
          });
        });
    });
  });

  return result;
};

module.exports = build;
