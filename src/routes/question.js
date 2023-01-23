const Database = require("../datebase");
const Crypto = require("crypto");

module.exports = {
  "POST /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      // TODO : type 추가
      const { question, answer } = req.body;

      const questionID = Crypto.randomUUID().replace(/-/g, "");
      const questionCol = Database.sharedInstance().getCollection("question");

      questionCol.set(questionID, { question: question, answer: answer });

      return {
        data: "ok",
      };
    },
  },
  "GET /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      return {
        data: "ok",
      };
    },
  },
};
