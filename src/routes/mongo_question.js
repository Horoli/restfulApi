const MongoDB = require("../mongodb");
const Utility = require("../utility");

module.exports = {
  "POST /mongo_question": {
    async handler(req, rep) {
      const { question, categoryId } = req.body;

      if (question === "" || categoryId === "") {
        const error = new Error("parameter is empty");
        error.status = 400;
        return error;
      }
      const questionId = Utility.UUID();
      const questionCol = await MongoDB.getCollection("question");
      const counterCol = await MongoDB.getCollection("counter");
      const subcategoryCol = await MongoDB.getCollection("subCategory");

      // TODO : image 저장 함수 추가
      const imageIds = [];

      // TODO : counterCol에 question 갯수를 올려주기 위해
      // graphLookup으로 최상단 데이터를 가져옴
      const getRootCategoryFromChildCategory = await subcategoryCol
        .aggregate([
          {
            $graphLookup: {
              from: "subCategory",
              startWith: "$parent",
              connectFromField: "parent",
              connectToField: "id",
              as: "ancestors",
            },
          },
          {
            $match: {
              id: categoryId,
              //   ancestors: { $size: 1 },
            },
          },
        ])
        .toArray();

      const ancestorId =
        getRootCategoryFromChildCategory[0].ancestors[0].parent;

      await counterCol.findOneAndUpdate(
        { key: ancestorId },
        { $inc: { counter: 1 } }
      );

      return {
        statusCode: 200,
      };
    },
  },
};
