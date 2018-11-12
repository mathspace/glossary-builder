const fs = require('fs');
const path = require('path');
const glob = require('glob');
const download = require('@now/build-utils/fs/download');

const build = require('./build');

exports.build = async ({ files, entrypoint, workPath, config }) => {
  await download(files, workPath);
  const files = glob
    .sync(config.data, { cwd: workPath })
    .map(file => fs.readFileSync(path.join(workPath, file)));
  console.log(files);
  const result = build(files);
  console.log(result);
  return result;
};
