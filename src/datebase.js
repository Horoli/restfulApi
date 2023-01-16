class Collection {
  constructor() {
    this.$dataset = {};
  }

  get(key) {
    return this.$dataset[key];
  }

  set(key, value) {
    return (this.$dataset[key] = value);
  }
}

class Database {
  constructor() {
    this.$db = {
      //
      // ex)
      // "collectionName" : {
      // }
    };
  }

  getCollection(collectionName) {
    // collection이 db에 없으면 신규 생성
    if (collectionName in this.$db) this.$db[collectionName] = new Collection();

    console.log(this.$db[collectionName]);
    // 있으면 그냥 return
    return this.$db[collectionName];
  }

  // singleTon patterns
  static sharedInstance() {
    if (!Database.__instance) Database.__instance = new Database();
    return Database.__instance;
  }
}

module.exports = Database;
