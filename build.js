const FileBlob = require('@now/build-utils/file-blob');
var remark = require('remark');
var recommended = require('remark-preset-lint-recommended');
var html = require('remark-html');

const createDatastore = require('./createDatastore');
const getLineage = require('./getLineage');

const build = data => {
  const datastore = createDatastore(data);
  const result = {};

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
          const fileName =
            [language.id, collection.id, definitionSet.id].join('/') + '.html';
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
              if (definition) {
                remark()
                  .use(recommended)
                  .use(html)
                  .process(
                    `# ${definition.title}\n\n${definition.body}`,
                    (err, data) => {
                      if (err) throw err;
                      result[fileName] = new FileBlob({
                        data: String(data),
                      });
                    },
                  );
              }
            });
          });
        });
    });
  });

  return result;
};

module.exports = build;
