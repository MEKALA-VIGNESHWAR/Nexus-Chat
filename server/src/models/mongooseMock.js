/**
 * Mongoose Query Mock Helper
 * A thenable class wrapping raw SQL executors to simulate Mongoose's chainable API.
 */
class MongooseQuery {
  constructor(executor) {
    this.executor = executor;
    this.populates = [];
    this.selectedFields = null;
    this.limitVal = null;
    this.skipVal = null;
    this.sortVal = null;
    this.isLean = false;
  }

  populate(path, select) {
    this.populates.push({ path, select });
    return this;
  }

  select(fields) {
    this.selectedFields = fields;
    return this;
  }

  limit(num) {
    this.limitVal = num;
    return this;
  }

  skip(num) {
    this.skipVal = num;
    return this;
  }

  sort(value) {
    this.sortVal = value;
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  async exec() {
    return this.executor(this);
  }

  then(onResolve, onReject) {
    return this.exec().then(onResolve, onReject);
  }

  catch(onReject) {
    return this.exec().catch(onReject);
  }
}

module.exports = MongooseQuery;
