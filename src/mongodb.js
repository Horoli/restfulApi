// const Fs = require("fs");
// const { Collection } = require("mongodb");
// const Path = require("path");
// const Client = require("mongodb").MongoClient;
const Utility = require("../src/utility");

const dummy = {
  a: {
    parent: undefined,
    data: 0
  },
  b: {
    parent: 'a',
    data: 1
  },
  c: {
    parent: 'b',
    data: 2
  },
  d: {
    parent: 'c',
    data: 3
  }
}

console.log("123")


console.log(
  Utility.graphLookup(dummy, 'c', 'parent')
)




// class DevCollection {
//   constructor(dataset = {}) {
//     this.$dataset = dataset;
//   }

//   set() {
//     var park = { name: "park", age: 15, gender: "m" };
//     this.$dataset.insertOne(park);
//   }

//   get() {
//     this.$dataset.findOne({}, function (err, result) {
//       if (err) {
//         console.log("err");
//       }
//       console.log("result", result);
//     });
//   }
// }

//
//
//

// class DevMongoDB {
//   constructor() {
//     this.$db = {};
//   }

//   getCollection(collectionName) {
//     const mongoURL = "mongodb://localhost:27017";
//     const client = new Client(mongoURL);
//     const getClient = client.db("test");

//     const col = getClient.collection(collectionName);

//     this.$db[collectionName] = new DevCollection(col);

//     return this.$db[collectionName];
//   }

//   static sharedInstance() {
//     if (!DevMongoDB.__instance) DevMongoDB.__instance = new DevMongoDB();
//     return DevMongoDB.__instance;
//   }
// }

// module.exports = DevMongoDB;
