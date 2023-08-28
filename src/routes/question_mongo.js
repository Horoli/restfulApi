const MongoDB = require("../mongodb");
const Utility = require("../utility");
const question = require("./question");

module.exports = {
  "POST /mongo_question": {
    // middlewares: ["mongo_auth"],
    async handler(req, rep) {
      const {
        question,
        answer,
        categoryId,
        difficulty,
        score,
        images,
        periodId,
        info,
        description,
      } = req.body;

      if (question === "" || answer === "" || categoryId === "") {
        const error = new Error("parameter is empty");
        error.status = 400;
        return error;
      }
      const questionId = Utility.UUID();
      const questionCol = await MongoDB.getCollection("question");
      const counterCol = await MongoDB.getCollection("counter");
      const subcategoryCol = await MongoDB.getCollection("subCategory");
      const imageCol = await MongoDB.getCollection("image");

      // TODO : image 저장 함수 추가
      const imageIds = [];

      if (images.length > 0) {
        for (const image of images) {
          // TODO : file name을 uuid로 설정
          const uuid = Utility.UUID(true);
          // TODO : image를 base64로 변환
          const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
          // TODO : imageCol에 image 저장
          await imageCol.insertOne({ id: uuid, image: base64Data });
          console.log("insert image", image);
          imageIds.push(uuid);
        }
      }

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
              ancestors: { $size: 1 },
            },
          },
        ])
        .toArray();

      console.log(getRootCategoryFromChildCategory);

      const ancestorId =
        getRootCategoryFromChildCategory[0].ancestors[0].parent;

      await counterCol.findOneAndUpdate(
        { key: ancestorId },
        { $inc: { counter: 1 } }
      );

      // TODO : questionCol에 question 저장
      const createNewQuestion = {
        id: questionId,
        question: question,
        answer: answer ?? "",
        updatedAt: Date.now(),
        createdAt: Date.now(),
        // TODO : categoryId는 children이 없는 categoryId를 받아야함.
        // children이 있는 id를 받으면 error
        categoryId: categoryId,
        // TODO : difficultyCol 생성 후 클라이언트에서 선택한 difficulty를 입력할 수 있도록 해야함
        difficulty: difficulty ?? "",
        score: score ?? 0,
        // TODO : periodCol 생성해서 id를 입력받음
        period: [],
        // TODO : 이미지(base64String) 저장
        imageIds: imageIds,
        info: info ?? "",
        description: description ?? "",
      };

      questionCol.insertOne(createNewQuestion);

      return {
        statusCode: 200,
      };
    },
  },

  "POST /mongo_filtered_question": {
    async handler(req, rep) {
      const { subCategoryIds } = req.body;
      console.log("subCategoryIds", subCategoryIds);

      const categoryCol = await MongoDB.getCollection("subCategory");
      const questionCol = await MongoDB.getCollection("question");

      const tmpData = [];

      for await (const subCategoryId of subCategoryIds) {
        // console.log("subCategoryId", subCategoryId);
        const filteredDatas = await questionCol
          .find({ categoryId: subCategoryId })
          .toArray();

        // console.log("filteredDatas", filteredDatas);

        tmpData.push(...filteredDatas);
      }
      console.log("tmpData", tmpData);

      return {
        data: tmpData,
      };
    },
  },

  "GET /mongo_question": {
    async handler(req, rep) {
      const questionCol = await MongoDB.getCollection("question");
      const questions = await questionCol.find().toArray();
      return {
        data: questions,
      };
    },
  },

  // TODO : 합계 값을 가져오는 쿼리 확인 후 수정
  "GET /mongo_question/counter": {
    async handler(req, rep) {
      const questionCol = await MongoDB.getCollection("question");
      const counterCol = await MongoDB.getCollection("counter");

      const getCounter = await counterCol.find().toArray();

      // TODO : counterCol 전체 데이터에 totalQuestionCount를 포함해서 return 해야함
      return {
        statusCode: 200,
        data: { totalQuestionCount: 1, ko: 1 },
      };
    },
  },

  // TODO : /question/random/20을 쿼리하면 20개의 랜덤한 문제를 가져옴
  "GET /mongo_question/random": {
    async handler(req, rep) {},
  },

  // TODO : 클라이언트에서 저장하고 있는 guestId를 쿼리하면
  // 해당 guest에 저장된 wishQuestion에 저장된 questionId를 활용하여
  // questionCol에서 가져와서 리턴해 줌
  "GET /mongo_qeustion/wish": {
    async handler(req, rep) {},
  },

  "GET /question/wish/by_subject": {
    async handler(req, rep) {},
  },

  // "GET /mongo_question/image/:id": {
  "GET /mongo_image/:id": {
    async handler(req, rep) {
      const { id } = req.query;
      console.log("image id", id);

      console.log("imageBuffer");

      const imageCol = await MongoDB.getCollection("image");
      const getImage = await imageCol.findOne({ id: id });

      console.log("getImage", getImage);
      const imageBuffer = Buffer.from(getImage.image, "base64");

      // console.log("imageBuffer", imageBuffer);
      // rep.header("Content-Type", "image/png");
      return imageBuffer;
    },
  },

  "PATCH /mongo_question": {
    async handler(req, rep) {
      const { id, question, answer, categoryId, images, info, description } =
        req.body;

      if (question === "" || answer === "" || categoryId === "") {
        console.log("question", question === "");
        const error = new Error("paramater is empty");
        error.status = 400;
        return error;
      }

      const questionCol = await MongoDB.getCollection("question");
      const imageCol = await MongoDB.getCollection("image");
      const counterCol = await MongoDB.getCollection("counter");
      const subcategoryCol = await MongoDB.getCollection("subCategory");
      const getQuestion = await questionCol.findOne({ id: id });
      const imageIds = [];

      console.log("mongoQuestion patch step1");
      // TODO : 기존에 저장된 이미지가 있고, 새로운 이미지가 없을 때
      if (images.length === 0 && getQuestion.imageIds.length !== 0) {
        for (const imageId of getQuestion.imageIds) {
          imageIds.push(imageId);
        }
      }

      console.log("mongoQuestion patch step2");
      // TODO : 기존에 저장된 이미지가 있고, 이미지가 없을때
      if (images.length !== 0 && getQuestion.imageIds.length !== 0) {
        // 기존에 저장된 이미지 삭제
        for (const imageId of getQuestion.imageIds) {
          imageCol.deleteOne({ id: imageId });
        }

        for (const image of images) {
          // TODO : file name을 uuid로 설정
          const uuid = Utility.UUID(true);
          // TODO : image를 base64로 변환
          const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
          // TODO : imageCol에 image 저장
          await imageCol.insertOne({ id: uuid, image: base64Data });
          console.log("insert image", image);
          imageIds.push(uuid);
        }
      }

      console.log("mongoQuestion patch step3");
      // TODO : 기존에 저장된 이미지가 없고, 새로운 이미지가 있을 때
      if (images.length !== 0 && getQuestion.imageIds.length === 0) {
        for (const image of images) {
          // TODO : file name을 uuid로 설정
          const uuid = Utility.UUID(true);
          // TODO : image를 base64로 변환
          const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
          // TODO : imageCol에 image 저장
          await imageCol.insertOne({ id: uuid, image: base64Data });
          console.log("insert image", image);
          imageIds.push(uuid);
        }
      }

      console.log("getQuestion.categoryId", getQuestion.categoryId);
      console.log(categoryId);
      // TODO : categoryId가 변경됐을때
      if (getQuestion.categoryId !== categoryId) {
        //   // TODO : 기존에 저장된 question의 categoryId의 parent를 찾아서 저장

        const beforAncestorInfo = await subcategoryCol
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
                id: getQuestion.categoryId,
                ancestors: { $size: 1 },
              },
            },
          ])
          .toArray();

        const afterAncestorInfo = await subcategoryCol
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
                ancestors: { $size: 1 },
              },
            },
          ])
          .toArray();

        // 변경 전
        const beforeAncestorId = beforAncestorInfo[0].ancestors[0].parent;
        // 변경 후
        const afterAncestorId = afterAncestorInfo[0].ancestors[0].parent;

        // 변경 전 counterCol의 카테고리에 -1
        await counterCol.findOneAndUpdate(
          { key: beforeAncestorId },
          { $inc: { counter: -1 } }
        );

        // 변경 후 counterCol의 카테고리에 +1
        await counterCol.findOneAndUpdate(
          { key: afterAncestorId },
          { $inc: { counter: 1 } }
        );
      }
      await questionCol.updateOne(
        { id: id },
        {
          $set: {
            question: question,
            answer: answer,
            categoryId: categoryId,
            updatedAt: Date.now(),
            imageIds: imageIds,
            description: description,
            info: info,
          },
        }
      );

      return {
        statusCode: 200,
        message: "ok",
        data: getQuestion,
      };
    },
  },

  "GET /mongo_question/pagination/:selectedPage/:showCount": {
    async handler(req, rep) {
      const questionCol = await MongoDB.getCollection("question");
      let selectedPage = parseInt(req.params.selectedPage);
      let showCount = parseInt(req.params.showCount);

      if (
        isNaN(selectedPage) ||
        selectedPage === 0 ||
        isNaN(showCount) ||
        showCount === 0
      ) {
        const error = new Error();
        if (isNaN(selectedPage)) error.message = "page is NaN";
        if (selectedPage === 0) error.message = "page is 0";
        if (isNaN(showCount)) error.message = "showCount is NaN";
        if (showCount === 0) error.message = "showCount is 0";
        error.status = 400;
        return error;
      }

      // skip 관련 후처리
      const offset = (selectedPage - 1) * showCount;

      const getPaginationData = await questionCol
        .find()
        .limit(showCount)
        .skip(offset)
        .toArray();

      console.log("asd", getPaginationData.length);

      const totalQuestionCount = await questionCol.count();
      const maxPage = Math.ceil(totalQuestionCount / showCount);
      const getQuestionCount = getPaginationData.length;

      return {
        maxPage: 1,
        totalQuestionCount: totalQuestionCount,
        getQuestionCount: getQuestionCount,
        data: getPaginationData,
      };
    },
  },

  "DELETE /mongo_question": {
    async handler(req, rep) {
      const { id } = req.body;
      if (id === undefined) {
        const error = new Error("please check your input");
        error.status = 400;
        return error;
      }
      // TODO : 삭제할 때, 입력된 id를 가진 question에 저장된 image를 삭제

      // TODO : 삭제할 때, 입력된 id를 가진 question의 categoryId의 parent를 찾아서
      // counter를 -1 해줌

      // TODO : 삭제할 때, 입력된 id를 가진 question을 삭제
    },
  },
};
