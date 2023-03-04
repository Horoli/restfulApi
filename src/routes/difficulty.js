const Database = require("../datebase");

module.exports = {
  "GET /difficulty": {
    async handler(req, rep) {
      const difficultyCol =
        Database.sharedInstance().getCollection("difficulty");
      return {
        status: 200,
        data: difficultyCol.get("difficulty"),
      };
    },
  },
};
