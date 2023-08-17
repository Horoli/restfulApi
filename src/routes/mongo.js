const MongoDB = require("../mongodb");

module.exports = {
  "GET /mongo_test": {
    async handler(req, rep) {
      const mainCategories = await MongoDB.getCollection("mainCategories");
      const insert = await mainCategories.insertOne({ zzz: "zzzz" });
      const find = await mainCategories.find().toArray();
      console.log(find);



      return {
        status: 200,
        data: [],
      };
    },
  },
};
