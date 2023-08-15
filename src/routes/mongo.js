const MongoDB = require("../mongodb");

module.exports = {
  "GET /mongo_test": {
    async handler(req, rep) {
      //   const asd = MongoDB.getCollection("test");
      //   console.log(MongoDB);
      const asd = MongoDB.getCollection("ddd");
      const zxc = await asd.find().toArray();

      console.log(zxc);

      //   console.log(asd);
      //   console.log(asd);
      //   console.log("asd", asd);

      //   asd.find(function (error, asd) {
      //     console.log("readAll");
      //     if (error) {
      //       console.log("error", error);
      //     }
      //   });

      return {
        status: 200,
        data: [],
      };
    },
  },
};
