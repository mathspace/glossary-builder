const assert = require('assert');
const path = require('path');

const Datastore = require('../lib/Datastore');
const build = require('../build');
const getLineage = require('../getLineage');

// findByRef
(() => {
  const datastore = new Datastore();

  datastore.define('post', []);
  datastore.create({
    type: 'post',
    id: 'a',
  });

  assert.deepStrictEqual(datastore.findRef('post/a'), {
    type: 'post',
    id: 'a',
  });
})();

// findByAll
(() => {
  const datastore = new Datastore();

  datastore.define('post', []);
  datastore.create({
    type: 'post',
    id: 'a',
  });
  datastore.create({
    type: 'post',
    id: 'b',
  });
  datastore.create({
    type: 'post',
    id: 'c',
  });

  assert.deepStrictEqual(datastore.findAll('post'), [
    { type: 'post', id: 'a' },
    { type: 'post', id: 'b' },
    { type: 'post', id: 'c' },
  ]);
})();

// findOne
(() => {
  const datastore = new Datastore();

  datastore.define('post', []);
  datastore.create({
    type: 'post',
    id: 'a',
  });

  assert.deepStrictEqual(datastore.findOne('post', 'a'), {
    type: 'post',
    id: 'a',
  });
})();

// validate
(() => {
  const datastore = new Datastore();

  datastore.define('comment', [
    record => (record.title !== 'Hello!' ? 'Incorrect title' : null),
  ]);

  datastore.create(
    {
      type: 'comment',
      id: 'a',
    },
    '/example/file.yml',
  );

  assert.throws(() => {
    datastore.validate();
  }, ({ message }) => message === 'Incorrect title (in comment/a from /example/file.yml)');
})();

// validate
(() => {
  const datastore = new Datastore();

  datastore.define('comment', [
    record => (record.title !== 'Hello!' ? 'Incorrect title' : null),
  ]);

  assert.doesNotThrow(() => {
    datastore.create({
      type: 'comment',
      id: 'a',
      title: 'Hello!',
    });
  });
})();

// Datastore.required
(() => {
  const datastore = new Datastore();
  datastore.define('comment', [Datastore.required('name')]);

  datastore.create({
    type: 'comment',
    id: 'a',
  });

  assert.throws(() => {
    datastore.validate();
  }, ({ message }) => message === 'Field "name" is required (in comment/a from unknown source)');
})();

// Datastore.notNull
(() => {
  const datastore = new Datastore();
  datastore.define('comment', [Datastore.notNull('name')]);

  datastore.create({
    type: 'comment',
    id: 'a',
    name: null,
  });

  assert.throws(() => {
    datastore.validate();
  }, ({ message }) => message === 'Field "name" must not be null (in comment/a from unknown source)');
})();

// Datastore.string
(() => {
  const datastore = new Datastore();
  datastore.define('comment', [Datastore.string('name')]);

  datastore.create({
    type: 'comment',
    id: 'a',
    name: 24,
  });

  assert.throws(() => {
    datastore.validate();
  }, ({ message }) => message === 'Field "name" must be a string (in comment/a from unknown source)');
})();

// Datastore.foreignKey
(() => {
  const datastore = new Datastore();
  datastore.define('post', []);
  datastore.define('comment', [Datastore.foreignKey('post')]);

  datastore.create({
    type: 'comment',
    id: 'a',
    post: 'post/a',
  });

  assert.throws(() => {
    datastore.validate();
  }, ({ message }) => message === 'Cannot find reference "post/a" for field "post" (in comment/a from unknown source)');
})();

// getLineage
(() => {
  const datastore = new Datastore();

  datastore.define('language');
  datastore.create({
    type: 'language',
    id: 'a',
    parent: null,
  });
  datastore.create({
    type: 'language',
    id: 'b',
    parent: 'language/a',
  });
  assert.deepStrictEqual(getLineage(datastore, 'language/b'), [
    'language/b',
    'language/a',
  ]);
})();

// build
(() => {
  const data = `
type: language
id: en
parent:
title: English
---
type: language
id: en-us
parent: language/en
title: English (United States)
---
type: curriculum
id: a
parent:
title: Collection A
---
type: curriculum
id: b
parent: curriculum/a
title: Collection B
---
type: definition-set
id: thing
---
type: definition
id: a
language: language/en
curriculum:
definitionSet: definition-set/thing
title: A Thing
body:
  Mum, colour and trialling.
---
type: definition
id: b
language: language/en-us
curriculum:
definitionSet: definition-set/thing
title: A Thing
body:
  Mom, color and trialing.
---
type: definition
id: c
language: language/en
curriculum: curriculum/b
definitionSet: definition-set/thing
title: A Thing
body:
  MOM, COLOR AND TRIALING!
`;

  assert.deepStrictEqual(
    Object.values(build([data]))
      .map(x => x.data)
      .sort(),
    [
      '<h1>A Thing</h1>\n<p>MOM, COLOR AND TRIALING!</p>\n',
      '<h1>A Thing</h1>\n<p>MOM, COLOR AND TRIALING!</p>\n',
      '<h1>A Thing</h1>\n<p>Mom, color and trialing.</p>\n',
      '<h1>A Thing</h1>\n<p>Mum, colour and trialling.</p>\n',
    ],
  );

  assert.deepStrictEqual(Object.keys(build([data])).sort(), [
    'en-us/a/thing.html',
    'en-us/b/thing.html',
    'en/a/thing.html',
    'en/b/thing.html',
  ]);
})();
