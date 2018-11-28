const TYPE_FORMAT = /^[a-zA-Z-_]+$/;
const ID_FORMAT = /^[a-zA-Z0-9-_)(]+$/;
const REF_FORMAT = /^[a-zA-Z-_]+\/[a-zA-Z0-9-_)(]+$/;

const splitRef = ref => {
  if (!REF_FORMAT.test(ref)) throw Error(`Invalid ref \`${ref}\``);
  return ref.split('/');
};

class Datastore {
  constructor() {
    this._types = new Set();
    this._records = {};
    this._validators = {};
    this._sources = {};
  }

  define(type, validators = []) {
    if (!TYPE_FORMAT.test(type)) throw Error(`Invalid type format ${type}`);
    if (this._types.has(type))
      throw Error(`The type \`${type}\` has already been defined`);
    this._types.add(type);
    this._records[type] = {};
    this._validators[type] = validators;
    this._sources[type] = {};
  }

  create(record, source = 'unknown source') {
    if (!record.type) throw Error('Records must include a type field');
    if (!record.id) throw Error('Records must include a id field');
    if (!this._types.has(record.type))
      throw Error(`Unknown type \`${record.type}\``);
    if (!ID_FORMAT.test(record.id))
      throw Error(`Invalid ID format ${record.id}`);
    if (this._records[record.type][record.id])
      throw Error(`Records already exists \`${record.type}/${record.id}\``);
    this._records[record.type][record.id] = record;
    this._sources[record.type][record.id] = source;
  }

  validate() {
    const violations = Array.from(this._types).reduce(
      (allViolations, type) =>
        allViolations.concat(
          this.findAll(type).reduce(
            (typeViolations, record) =>
              typeViolations.concat(
                this._validators[record.type]
                  .map(validator => validator(record, this))
                  .filter(Boolean)
                  .map(message => ({
                    message,
                    ref: `${record.type}/${record.id}`,
                    source: this._sources[record.type][record.id],
                  })),
              ),
            [],
          ),
        ),
      [],
    );

    if (violations.length)
      throw Error(
        violations
          .map(
            ({ message, ref, source }) =>
              `${message} (in ${ref} from ${source})`,
          )
          .join('\n\n'),
      );
  }

  findAll(type) {
    if (!this._types.has(type)) throw Error(`Unknown type \`${type}\``);
    return Object.keys(this._records[type]).map(id => this._records[type][id]);
  }

  findOne(type, id) {
    if (!this._types.has(type)) throw Error(`Unknown type \`${type}\``);
    return this._records[type][id];
  }

  findRef(ref) {
    return this.findOne.apply(this, splitRef(ref));
  }
}

Datastore.required = (field, message = null) => {
  return record =>
    record[field] === undefined
      ? message || `Field "${field}" is required`
      : null;
};

Datastore.notNull = (field, message = null) => {
  return record =>
    record[field] === null
      ? message || `Field "${field}" must not be null`
      : null;
};

Datastore.string = (field, message = null) => {
  return record =>
    record[field] && typeof record[field] !== 'string'
      ? message || `Field "${field}" must be a string`
      : null;
};

Datastore.foreignKey = (field, message = null) => {
  return (record, datastore) =>
    record[field] && !datastore.findRef(record[field])
      ? message ||
        `Cannot find reference "${record[field]}" for field "${field}"`
      : null;
};

module.exports = Datastore;
