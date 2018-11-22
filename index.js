const download = require('@now/build-utils/fs/download');

const build = require('./build');
const loadData = require('./loadData');

exports.build = async ({ files, entrypoint, workPath, config }) => {
  await download(files, workPath);
  const data = loadData(config.data, workPath);
  return build(data);
};
