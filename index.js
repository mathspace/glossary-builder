const fs = require('fs');
const path = require('path');
const download = require('@now/build-utils/fs/download');

const build = require('./build');

exports.build = async ({ files, entrypoint, workPath, config }) => {
  console.log(files);
  console.log(workPath);
  console.log(config);

  await download(
    Object.keys(files)
      .filter(key => key.startsWith(config.data))
      .reduce((result, key) => ({ ...result, [key]: files[key] }), {}),
    workPath,
  );

  const mountpoint = path.dirname(entrypoint);
  const root = path.join(workPath, mountpoint);

  console.log(mountpoint);
  console.log(root);

  return build(
    fs
      .readdirSync(root)
      .map(file => fs.readFileSync(path.join(root, file))),
  );
};
