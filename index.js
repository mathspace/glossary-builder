const fs = require('fs');
const path = require('path');
const download = require('@now/build-utils/fs/download');

const build = require('./build');

exports.build = async ({ files, workPath, config }) => {
  await download(
    Object.keys(files)
      .filter(key => key.startsWith(config.data))
      .reduce((result, key) => ({ ...result, [key]: files[key] }), {}),
    workPath,
  );

  return build(
    fs
      .readdirSync(workPath)
      .map(file => fs.readFileSync(path.join(workPath, file))),
  );
};
