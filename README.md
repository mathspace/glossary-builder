# Glossary Builder

A custom [Now](https://zeit.co/now) builder that can generate a glossary of
terms organised by collections and languages.

## Getting started

In your `now.json` file:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "null",
      "use": "@mathspace/glossary-builder",
      "config": {
        "title": "My Glossary",
        "data": "data.yml"
      }
    }
  ]
}
```

In your `data.yml` file:

```yaml
# Every record must have type and id fields.
# Type fields: /[a-zA-Z-_]+/
# ID fields: /[a-zA-Z0-9-_]+/
# The value of the id field must be unique within the context of the type.
# Foreign key refs are a type and an id combined with slash ("type/id").
---
type: language
id: en
# Reference to another language that is a superset of this language. Nullable.
parent:
title: English
---
type: collection
id: a
# Reference to another collection that is a superset of this collection. Nullable.
parent:
title: Collection A
---
type: definition-set
id: thing
---
type: definition
id: a
# ID of the language this definition belongs to. Required.
language: language/en
# ID of the collection this definition belongs to. Nullable.
collection:
# ID of the set this definition belongs to. Required.
definitionSet: definition-set/thing
title: A Thing
body:
  It's a thing.
```
