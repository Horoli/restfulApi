const Fs = require("fs");
const Path = require("path");
const OnChange = require("on-change");

class Collection {
  constructor(dataset = {}) {
    this.$dataset = dataset;
  }

  get(key) {
    const keyArr = Array.isArray(key) ? key : key.split(".");

    if (keyArr.length === 0) return this.$dataset;

    let box = this.$dataset;

    for (let i = 0; i < keyArr.length; i++) {
      box = box[keyArr[i]];

      if (box === undefined) return;
    }

    return box;
  }

  set(key, value) {
    const keyArr = Array.isArray(key) ? key : key.split(".");

    if (keyArr.length === 0) return;

    const lastKey = keyArr.pop();

    let box = this.$dataset;

    for (let i = 0; i < keyArr.length; i++) {
      const key = keyArr[i];

      if (!box.hasOwnProperty(key) || typeof box[key] !== "object")
        box[key] = {};

      box = box[key];
    }

    box[lastKey] = value;

    return value;
  }

  del(key) {
    const keyArr = Array.isArray(key) ? key : key.split(".");

    if (keyArr.length === 0) return;

    const lastKey = keyArr.pop();

    let box = this.$dataset;

    for (let i = 0; i < keyArr.length; i++) {
      box = box[keyArr[i]];
      if (box === undefined) return;
    }

    delete box[lastKey];
  }
}

class Database {
  constructor() {
    this.$dbPath = process.env.DB_PATH ?? Path.join(process.cwd(), "database");
    this.$db = {};
  }

  getCollection(collectionName) {
    if (!this.$db.hasOwnProperty(collectionName)) {
      let data = {};
      // DB directory 없으면 추가
      if (!Fs.existsSync(this.$dbPath))
        Fs.mkdirSync(this.$dbPath, { recursive: true });

      /**
       * DB Path에 Database가 존재할 때 데이터 로딩
       *
       */
      const collPath = Path.join(this.$dbPath, `${collectionName}.db`);

      if (Fs.existsSync(collPath)) {
        try {
          const dataBuffer = Fs.readFileSync(collPath, "utf-8");
          data = JSON.parse(dataBuffer);
        } catch (err) {
          console.log("#DB Load Failed", err);
        }
      }

      const onChangeInstance = OnChange(data, (path, cVal, pVal) => {
        if (cVal === pVal) return;

        console.log("onChanged", pVal, "=>", cVal);
        try {
          Fs.writeFileSync(collPath, JSON.stringify(data));
        } catch (err) {
          console.log("#DB Load Failed", err);
        }
      });

      this.$db[collectionName] = new Collection(onChangeInstance);
    }
    return this.$db[collectionName];
  }

  // singleTon patterns
  static sharedInstance() {
    if (!Database.__instance) Database.__instance = new Database();
    return Database.__instance;
  }
}

module.exports = Database;
