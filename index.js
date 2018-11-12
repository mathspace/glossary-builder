const FileBlob = require('@now/build-utils/file-blob');

const build = require('./build');

exports.build = async ({ files, config }) => {
  const data = await Promise.all(
    Object.keys(files)
      .filter(key => key.startsWith(config.data))
      .map(key => files[key].toStream())
      .map(stream =>
        FileBlob.fromStream({
          stream,
        }),
      ),
  );
  return build(data);
};
