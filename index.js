const FileBlob = require('@now/build-utils/file-blob');

exports.build = async ({ files, config }) => {
  const data = await Object.keys(files)
    .filter(key => key.startsWith(config.data))
    .map(key => files[key].toStream())
    .reduce(async (promise, stream) => {
      await promise;
      return FileBlob.fromStream({
        stream,
      }).toString();
    }, Promise.resolve());

  return build(data);
};
