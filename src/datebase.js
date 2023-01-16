const Fs = require("fs");

class Collection {
  constructor() {
    this.$dataset = {};
  }

  get(key) {
    const dbJson = Fs.readFileSync("db.json");
    console.log(`dbJson ${dbJson}`);
    return dbJson[key];

    // return this.$dataset[key];
  }

  set(key, value) {
    this.$dataset[key] = value;
    Fs.writeFileSync("db.json", JSON.stringify(this.$dataset));
    return (this.$dataset[key] = value);
  }
}

class Database {
  constructor() {
    this.$db = {
      // users: "ddddd",
      // ex)
      // "collectionName" : {
      // }
    };
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
    console.log(`step 5 : ${this.$db.$dataset}`);

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
