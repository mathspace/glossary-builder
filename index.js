const fs = require('fs');
const path = require('path');
const glob = require('glob');
const download = require('@now/build-utils/fs/download');

const build = require('./build');

exports.build = async ({ files, entrypoint, workPath, config }) => {
  await download(files, workPath);
  return build(
    glob
      .sync(config.data, { cwd: workPath })
      .map(file => fs.readFileSync(path.join(workPath, file))),
  );
};
