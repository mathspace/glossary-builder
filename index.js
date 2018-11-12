const fs = require('fs');
const path = require('path');
const glob = require('glob');
const download = require('@now/build-utils/fs/download');

const build = require('./build');

exports.build = async ({ files, entrypoint, workPath, config }) => {
  await download(files, workPath);
  const data = glob
    .sync(config.data, { cwd: workPath })
    .map(file => fs.readFileSync(path.join(workPath, file)));
  console.log(data);
  const result = build(data);
  console.log(result);
  return result;
};
