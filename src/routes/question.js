const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  // TODO : 주관식(short-form) 문제 생성
  "POST /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { question, answer, categoryID, difficulty, score, periodID } = req.body;

      const questionID = Utility.UUID();
      const questionCol = Database.sharedInstance().getCollection("question");


      return {
        statusCode: 200,
        data:
          questionCol.set(
            questionID, {
            id: questionID,
            question: question,
            answer: answer,
            updatedAt: Date.now(),
            createdAt: Date.now(),
            // TODO : categoryId는 children이 없는 categoryId를 받아야함.
            // children이 있는 id를 받으면 error
            category: categoryID,
            // TODO : difficultyCol 생성 후 클라이언트에서 선택한 difficulty를 입력할 수 있도록 해야함
            difficulty: difficulty,
            score: score,
            // TODO : periodCol 생성해서 id를 입력받음
            // 
            period: [],
          })
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

  // TODO : 객관식(multipleChoice) 문제 생성
  "POST /mcquestion": {
    middlewares: ["auth"],
    async handler(req, rep) {
      return {
        data: "ok",
      };
    },
  },


};
