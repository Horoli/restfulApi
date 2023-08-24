const MongoDB = require("../mongodb");
const Utility = require("../utility");

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
          console.log('insert image', image);
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
        answer: answer ?? '',
        updatedAt: Date.now(),
        createdAt: Date.now(),
        // TODO : categoryId는 children이 없는 categoryId를 받아야함.
        // children이 있는 id를 받으면 error
        categoryId: categoryId,
        // TODO : difficultyCol 생성 후 클라이언트에서 선택한 difficulty를 입력할 수 있도록 해야함
        difficulty: difficulty ?? '',
        score: score ?? 0,
        // TODO : periodCol 생성해서 id를 입력받음
        period: [],
        // TODO : 이미지(base64String) 저장
        imageIds: imageIds,
        info: info ?? '',
        description: description ?? '',
      }

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
      for (const subCategoryId of subCategoryIds) {
        const filteredDatas = await categoryCol.find({ categroyId: subCategoryId }).toArray();

        tmpData.push(...filteredDatas);
      }

      return {
        data: tmpData
      }
    }
  },

  "GET /mongo_question": {
    async handler(req, rep) {
      const questionCol = await MongoDB.getCollection("question");
      const questions = await questionCol.find().toArray();
      return {
        data: questions
      }
    }
  },

  "GET /mongo_question/image/:id": {
    async handler(req, rep) {
      const { id } = req.query;
      const imageCol = await MongoDB.getCollection("image");
      const getImage = await imageCol.findOne({ id: id });
      const imageBuffer = Buffer.from(getImage.image, "base64");
      rep.header("Content-Type", "image/png");
      return imageBuffer;
    }
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
      const couterCol = await MongoDB.getCollection("counter");
      const subcategoryCol = await MongoDB.getCollection("subCategory");

      const getQuestion = await questionCol.findOne({ id: id });
      const imageIds = [];

      // TODO : 기존에 저장된 이미지가 있고, 새로운 이미지가 없을 때
      if (images.length === 0 && getQuestion.imageIds.length !== 0) {
        for (const imageId of getQuestion.imageIds) {
          imageIds.push(imageId);
        }
      }

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
          console.log('insert image', image);
          imageIds.push(uuid);
        }
      }

      // TODO : 기존에 저장된 이미지가 없고, 새로운 이미지가 있을 때
      if (images.length !== 0 && getQuestion.imageIds.length === 0) {
        for (const image of images) {
          // TODO : file name을 uuid로 설정
          const uuid = Utility.UUID(true);
          // TODO : image를 base64로 변환
          const base64Data = image.replace(/^data:image\/jpeg;base64,/, "");
          // TODO : imageCol에 image 저장
          await imageCol.insertOne({ id: uuid, image: base64Data });
          console.log('insert image', image);
          imageIds.push(uuid);
        }
      }
      // TODO : categoryId가 변경됐을때
      if (getQuestion.categoryId !== categoryId) {
        // TODO : 기존에 저장된 question의 categoryId의 parent를 찾아서 저장

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
                id: getQuestion.categoryId,
                //   ancestors: { $size: 1 },
              },
            },
          ])
          .toArray();

      }
    }
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

    }

  }

};
