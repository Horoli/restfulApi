const Fs = require("fs");

class Collection {
  constructor() {
    this.$dataset = {};
  }

  get(key) {
    console.log(key);
    this.$dataset = Fs.readFileSync("db.json");
    console.log(this.$dataset);
    console.log(JSON.parse(this.$dataset));
    return JSON.parse(this.$dataset)[key];
  }

  set(key, value) {
    this.$dataset[key] = value;
    Fs.writeFileSync("db.json", JSON.stringify(this.$dataset));
    return (this.$dataset[key] = value);
  }
}

class Database {
  constructor() {
    this.$db = {};
  }

  getCollection(collectionName) {
    console.log(`${collectionName}`);
    console.log(`${collectionName in this.$db}`);
    // collection이 db에 없으면 신규 생성
    console.log(`step 3 : ${this.$db[collectionName]}`);
    if (!(collectionName in this.$db)) {
      this.$db[collectionName] = new Collection();
    }

    console.log(`step 4 : ${this.$db[collectionName]}`);

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
