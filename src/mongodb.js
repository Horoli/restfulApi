const { MongoClient, MongoError, ObjectId } = require("mongodb");

class MongoDB {
  constructor() {
    this.$config = {};
    this.$url = undefined;
    this.$mongoOptions = {};
    this.$mongoConnection = undefined;
  }

  async connect(config) {
    let authAccount = "";
    let authSource = "";
    if (!!config.user) {
      authAccount = `${config.user}:${config.pass}@`;
      authSource = `${config.db}?authSource=admin`;
    }
    this.$config = config;
    this.$url = `mongodb://${authAccount}${config.host}:${config.port}/${authSource}`;

    this.$mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: config.db,
    };
    this.$mongoConnection = await MongoClient.connect(
      this.$url,
      this.$mongoOptions
    ).catch((err) => err);

    if (this.$mongoConnection instanceof MongoError) {
      console.error("MongoDB Connection Error", this.$mongoConnection);
      process.exit();
    }
  }

  getDatabase(name = this.$config.db) {
    return this.$mongoConnection.db(name);
  }
  async getCollection(name) {
    const getCollectionsList = await this.getDatabase()
      .listCollections()
      .toArray();

    if (getCollectionsList.length === 0) {
      console.log(`getCollectionsList ${name} is undefined`);
      console.log("getCollectionsList", getCollectionsList);
      await this.getDatabase().createCollection(name);
      return this.getDatabase().collection(name);
    }
    return this.getDatabase().collection(name);
  }

  static sharedInstance() {
    if (!MongoDB.__instance) MongoDB.__instance = new MongoDB();
    return MongoDB.__instance;
  }
  static getCollection(name) {
    return MongoDB.sharedInstance().getCollection(name);
  }
  static objectId() {
    return new ObjectId();
  }
}

module.exports = MongoDB;
