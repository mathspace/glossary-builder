const fs = require('fs');
const path = require('path');
const glob = require('glob');

const loadData = (files, workPath) =>
  glob
    .sync(files, { cwd: workPath })
    .map(file => fs.readFileSync(path.join(workPath, file)).toString());

module.exports = loadData;
