const TYPE_FORMAT = /^[a-zA-Z-_]+$/;
const ID_FORMAT = /^[a-zA-Z0-9-_]+$/;
const REF_FORMAT = /^[a-zA-Z-_]+\/[a-zA-Z0-9-_]+$/;

const splitRef = ref => {
  if (!REF_FORMAT.test(ref)) throw Error(`Invalid ref \`${ref}\``);
  return ref.split('/');
};

class Datastore {
  constructor() {
    this._types = new Set();
    this._records = {};
    this._validators = {};
  }

  define(type, validators = []) {
    if (!TYPE_FORMAT.test(type)) throw Error(`Invalid type format ${type}`);
    if (this._types.has(type))
      throw Error(`The type \`${type}\` has already been defined`);
    this._records[type] = {};
    this._validators[type] = validators;
    this._types.add(type);
  }

  create(record) {
    if (!record.type) throw Error('Records must include a type field');
    if (!record.id) throw Error('Records must include a id field');
    if (!this._types.has(record.type))
      throw Error(`Unknown type \`${record.type}\``);
    if (!ID_FORMAT.test(record.id))
      throw Error(`Invalid ID format ${record.id}`);
    if (this._records[record.type][record.id])
      throw Error(`Records already exists \`${record.type}/${record.id}\``);
    this._validators[record.type].forEach(validator => validator(record, this));
    this._records[record.type][record.id] = record;
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
  return record => {
    if (record[field] === null || record[field] === undefined)
      throw Error(
        message || `Missing \`${field}\` on ${record.type}/${record.id}`,
      );
  };
};

Datastore.isString = (field, message = null) => {
  return record => {
    if (record[field] && typeof record[field] !== 'string')
      throw Error(
        message ||
          `Value \`${record[field]}\` of \`${field}\` on ${record.type}/${
            record.id
          } must be a string`,
      );
  };
};

Datastore.foreignKey = (field, message = null) => {
  return (record, datastore) => {
    if (record[field] && !datastore.findRef(record[field]))
      throw Error(
        message || `Missing \`${field}\` on ${record.type}/${record.id}`,
      );
  };
};

module.exports = Datastore;
