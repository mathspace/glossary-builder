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
      const curriculumIndex = {};
      datastore.findAll('definition-set').forEach(definitionSet => {
        const fileName =
          [language.id, curriculum.id, definitionSet.id].join('/') + '.html';
        curriculumLineage.forEach(searchCurriculum => {
          if (result[fileName]) return;
          languageLineage.forEach(searchLanguage => {
            if (result[fileName]) return;
            const definition = datastore
              .findAll('definition')
              .find(
                record =>
                  record.language === searchLanguage &&
                  record.curriculum === searchCurriculum &&
                  record.definitionSet === `definition-set/${definitionSet.id}`,
              );
            if (definition) {
              curriculumIndex[fileName] = definition.title;
              remark()
                .use(recommended)
                .use(html)
                .process(
                  `# ${definition.title}\n\n${definition.body}`,
                  (err, html) => {
                    if (err) throw err;
                    result[fileName] = new FileBlob({
                      data: String(html),
                    });
                  },
                );
            }
          });
        });
      });
      result[[language.id, curriculum.id].join('/') + '.html'] = new FileBlob({
        data: `<h1>${curriculum.title}</h1>\n<ul>${Object.entries(
          curriculumIndex,
        )
          .sort((a, b) => a[1].localeCompare(b[1]))
          .map(
            ([file, title]) => `<li><a href="/${file}">${title}</a></li>`,
          ).join('\n')}</ul>`,
      });
    });
  });

  return result;
};

module.exports = build;
