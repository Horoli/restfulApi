const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  // TODO : 주관식(short-form) 문제 생성
  "POST /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { question, answer, categoryID, difficulty, score, images, periodID } =
        req.body;

      const questionID = Utility.UUID();
      const questionCol = Database.sharedInstance().getCollection("question");

      return {
        statusCode: 200,
        data: questionCol.set(questionID, {
          id: questionID,
          question: question,
          answer: answer,
          updatedAt: Date.now(),
          createdAt: Date.now(),
          // TODO : categoryId는 children이 없는 categoryId를 받아야함.
          // children이 있는 id를 받으면 error
          categoryID: categoryID,
          // TODO : difficultyCol 생성 후 클라이언트에서 선택한 difficulty를 입력할 수 있도록 해야함
          difficulty: difficulty,
          score: score,
          // TODO : periodCol 생성해서 id를 입력받음
          period: [],
          // TODO : 이미지(base64String) 저장
          images: images,
        }),
      };
    },
  },

  "POST /filteredquestion": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { subCategoryID } = req.body;
      console.log("subCategoryID", subCategoryID);

      const categoryCol = Database.sharedInstance().getCollection("category");
      const questionCol = Database.sharedInstance().getCollection("question");

      const questionValues = Object.values(questionCol["$dataset"]);

      // console.log("question", questionValues);

      const filteredQuestion = questionValues.filter(
        (item) => item.categoryID === subCategoryID
      );

      console.log("filteredQuestion", filteredQuestion);

      // const asd = Object.values(question).find(
      //   (question) => question.categoryID == subCategoryID
      // );
      // console.log("asd", asd.length);

      return {
        data: filteredQuestion,
      };
    },
  },

  // TODO : object.values만 return(type : list)
  "GET /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const questionCol = Database.sharedInstance().getCollection("question");
      const question = questionCol["$dataset"];
      return {
        data: Object.values(question),
      };
    },
  },

  "PATCH /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id, question, answer, categoryID } = req.body;

      const questionCol = Database.sharedInstance().getCollection("question");

      const getQuestion = questionCol["$dataset"][id];

      getQuestion.question = question;
      getQuestion.answer = answer;
      getQuestion.categoryID = categoryID;
      getQuestion.updatedAt = Date.now();

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
