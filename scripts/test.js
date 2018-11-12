const assert = require('assert');
const path = require('path');

const Datastore = require('../lib/Datastore');
const build = require('../build');
const getLineage = require('../getLineage');

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

assert.deepStrictEqual(datastore.findRef('post/a'), { type: 'post', id: 'a' });
assert.deepStrictEqual(datastore.findAll('post'), [
  { type: 'post', id: 'a' },
  { type: 'post', id: 'b' },
  { type: 'post', id: 'c' },
]);
assert.deepStrictEqual(datastore.findOne('post', 'a'), {
  type: 'post',
  id: 'a',
});

assert.throws(() => {
  datastore.create({
    type: 'comment',
    id: 'a',
  });
});

datastore.define('comment', [
  record => {
    if (record.title !== 'Hello!') throw Error('Incorrect title');
  },
]);

assert.throws(() => {
  datastore.create({
    type: 'comment',
    id: 'a',
  });
});

datastore.create({
  type: 'comment',
  id: 'a',
  title: 'Hello!',
});

assert.deepStrictEqual(datastore.findRef('post/a'), { type: 'post', id: 'a' });
assert.deepStrictEqual(datastore.findAll('post'), [
  { type: 'post', id: 'a' },
  { type: 'post', id: 'b' },
  { type: 'post', id: 'c' },
]);
assert.deepStrictEqual(datastore.findOne('post', 'a'), {
  type: 'post',
  id: 'a',
});

assert.deepStrictEqual(datastore.findRef('comment/a'), {
  type: 'comment',
  id: 'a',
  title: 'Hello!',
});
assert.deepStrictEqual(datastore.findAll('comment'), [
  { type: 'comment', id: 'a', title: 'Hello!' },
]);
assert.deepStrictEqual(datastore.findOne('comment', 'a'), {
  type: 'comment',
  id: 'a',
  title: 'Hello!',
});

const datastore2 = new Datastore();
datastore2.define('language');
datastore2.create({
  type: 'language',
  id: 'a',
  parent: null,
});
datastore2.create({
  type: 'language',
  id: 'b',
  parent: 'language/a',
});
assert.deepStrictEqual(getLineage(datastore2, 'language/b'), [
  'language/b',
  'language/a',
]);

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
type: collection
id: a
parent:
title: Collection A
---
type: collection
id: b
parent: collection/a
title: Collection B
---
type: definition-set
id: thing
---
type: definition
id: a
language: language/en
collection:
definitionSet: definition-set/thing
title: A Thing
body:
  Mum, colour and trialling.
---
type: definition
id: b
language: language/en-us
collection:
definitionSet: definition-set/thing
title: A Thing
body:
  Mom, color and trialing.
---
type: definition
id: c
language: language/en
collection: collection/b
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
    'A Thing\n\nMOM, COLOR AND TRIALING!',
    'A Thing\n\nMOM, COLOR AND TRIALING!',
    'A Thing\n\nMom, color and trialing.',
    'A Thing\n\nMum, colour and trialling.',
  ],
);

assert.deepStrictEqual(Object.keys(build([data])).sort(), [
  'en-us/a/thing',
  'en-us/b/thing',
  'en/a/thing',
  'en/b/thing',
]);
