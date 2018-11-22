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
    const curriculums = datastore.findAll('curriculum').forEach(curriculum => {
      const curriculumLineage = getLineage(
        datastore,
        `curriculum/${curriculum.id}`,
      ).concat([null]);
      const definitionSets = datastore
        .findAll('definition-set')
        .forEach(definitionSet => {
          const fileName =
            [language.id, curriculum.id, definitionSet.id].join('/') + '.html';
          curriculumLineage.forEach(searchCollection => {
            if (result[fileName]) return;
            languageLineage.forEach(searchLanguage => {
              if (result[fileName]) return;
              const definition = datastore
                .findAll('definition')
                .find(
                  record =>
                    record.language === searchLanguage &&
                    record.curriculum === searchCollection &&
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
