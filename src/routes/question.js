const Database = require("../datebase");

const Config = require("../config.json");
const Utility = require("../utility");

module.exports = {
  // TODO : 주관식(short-form) 문제 생성
  "POST /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const {
        question,
        answer,
        categoryID,
        difficulty,
        score,
        images,
        periodID,
        info,
        description,
      } = req.body;

      if (question === "" || answer === "" || categoryID === "") {
        console.log("question", question === "");
        const error = new Error("paramater is empty");
        error.status = 400;
        return error;
      }

      const questionID = Utility.UUID();
      const questionCol = Database.sharedInstance().getCollection("question");
      const categoryCol = Database.sharedInstance().getCollection("category");

      const imageIDs = [];

      if (images.length > 0) {
        for (const image of images) {
          const imageID = Utility.saveImage(image);
          imageIDs.push(imageID);
        }
      }

      // TODO : Trace Main Category from SubCategory using GraphLookup
      /**
       * graphLook 으로 가져온 데이터는 내림차순으로 정렬되어 있음
       * 따라서 가장 첫 번째에 있는 데이터가 최상위 subCategory이다.
       **/
      const rootCategoryId =
        Utility.getRootCategoryFromChildCategory(categoryID);
      Utility.addCounter(rootCategoryId, 1);

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
          imageIDs: imageIDs,
          info: info,
          description: description,
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

      const filteredQuestion = questionValues.filter(
        (item) => item.categoryID === subCategoryID
      );

      console.log("filteredQuestion", filteredQuestion);

      const returnValue = filteredQuestion;

      return {
        data: returnValue,
      };
    },
  },

  "GET /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      // const amount = 20;
      const questionCol = Database.sharedInstance().getCollection("question");
      const questions = Object.values(questionCol["$dataset"]);

      // questions.slice((page - 1) * amount, page * amount);

      // TODO : amount만

      return {
        data: questions,
      };
    },
  },


  // image/id를 입력받으면 해당 id를 가져와
  // buffer로 변환 후 return 해줌
  // 해당 method는 클라이언트에서 image를 활용하는 곳에서만
  "GET /image/:id": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id } = req.params;
      const imageBase64String = Utility.getImage(id);
      const imageBuffer = Buffer.from(imageBase64String, "base64");
      rep.header("Content-Type", "image/png");
      return imageBuffer;
    },
  },

  "PATCH /question": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id, question, answer, categoryID, images, info, description } =
        req.body;

      if (question === "" || answer === "" || categoryID === "") {
        console.log("question", question === "");
        const error = new Error("paramater is empty");
        error.status = 400;
        return error;
      }

      const questionCol = Database.sharedInstance().getCollection("question");

      const getQuestion = questionCol["$dataset"][id];

      const imageIDs = [];

      console.log("getQuestion.imageIDs", getQuestion.imageIDs);
      console.log(getQuestion.imageIDs.length);
      console.log("images.length", images.length);

      // TODO : 기존에 저장된 이미지가 있고, 새로운 이미지가 없을 때
      if (images.length === 0 && getQuestion.imageIDs.length !== 0) {
        // console.log('image step1');
        imageIDs = getQuestion.imageIDs;
      }

      // TODO : 기존에 저장된 이미지가 있고, 새로운 이미지가 있을 때
      if (images.length !== 0 && getQuestion.imageIDs.length !== 0) {
        console.log("image step2");

        // 기존에 저장된 이미지 삭제
        for (const imageID of getQuestion.imageIDs) {
          Utility.deleteImage(imageID);
        }

        for (const image of images) {
          const imageID = Utility.saveImage(image);
          imageIDs.push(imageID);
        }
      }

      // TODO : 기존에 저장된 이미지가 없고, 새로운 이미지가 있을 때
      if (images.length !== 0 && getQuestion.imageIDs.length === 0) {
        console.log("image step3");
        for (const image of images) {
          const imageID = Utility.saveImage(image);
          imageIDs.push(imageID);
        }
      }

      if (getQuestion.categoryID !== categoryID) {
        console.log('categoryID is changed');
        const rootCategoryId = Utility.getRootCategoryFromChildCategory(getQuestion.categoryID);
        Utility.addCounter(rootCategoryId, -1);
        const newRootCategoryId = Utility.getRootCategoryFromChildCategory(categoryID);
        Utility.addCounter(newRootCategoryId, 1);
      }

      getQuestion.question = question;
      getQuestion.answer = answer;
      getQuestion.categoryID = categoryID;
      getQuestion.updatedAt = Date.now();
      getQuestion.imageIDs = imageIDs;
      getQuestion.description = description;
      getQuestion.info = info;

      return {
        statusCode: 200,
        message: "ok",
        data: getQuestion,
      };
    },
  },

  "GET /question/counter": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const questionCol = Database.sharedInstance().getCollection("question");
      const counterCol = Database.sharedInstance().getCollection("counter");
      const questions = Object.values(questionCol["$dataset"]);
      const counter = counterCol["$dataset"];

      console.log('counter', counter);
      return {
        totalQuestionCount: questions.length,
        data: counter,
      }
    }
  },

  // TODO : /question/random/20을 쿼리하면 20개의 랜덤한 문제를 가져옴
  "GET /question/random/:amount": {
    middlewares: ["auth"],
    async handler(req, rep) {
      let amount = req.params.amount;

      console.log('amount', amount);
      const questionCol = Database.sharedInstance().getCollection("question");
      const questions = Object.values(questionCol["$dataset"]);

      console.log('questions', questions.length)

      // max value is 100
      if (amount > 100) amount = 100;
      // min value is 10
      else if (amount < 10 || amount === undefined) amount = 10;

      return {
        totalQuestionCount: questions.length,
        data: questions.sort(() => Math.random() - 0.5).slice(0, amount),
      };
    },
  },

  // TODO : 클라이언트에서 저장하고 있는 guestId를 쿼리하면
  // 해당 guest에 저장된 wishQuestion에 저장된 questionId를 활용하여
  // questionCol에서 가져와서 리턴해 줌
  "GET /question/wish": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const guestId = req.token.id;

      const guestCol = Database.sharedInstance().getCollection("guest");
      const questionCol = Database.sharedInstance().getCollection("question");
      const guestInfo = guestCol.get(guestId);

      const getQuestion = guestInfo.wishQuestion.map((e) =>
        questionCol.get(e)
      );

      console.log("convertQuestion", getQuestion.length);

      if (getQuestion.length === 0) {
        const error = new Error("wishQuestion is empty");
        error.status = 400;
        return error;
      }

      return {
        data: getQuestion,
      };
    },
  },

  "GET /question/wish/by_subject": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const guestId = req.token.id;

      const guestCol = Database.sharedInstance().getCollection("guest");
      const questionCol = Database.sharedInstance().getCollection("question");
      const categoryCol = Database.sharedInstance().getCollection("category");
      const categories = categoryCol.get("subCategories");

      const guestInfo = guestCol.get(guestId);

      // TODO : 
      const mapOfWish = {};
      Object.keys(Config.mainCategories).forEach((e) => mapOfWish[e] = []);

      const getQuestion = guestInfo.wishQuestion.map((e) =>
        questionCol.get(e)
      );

      getQuestion.map((question) => {

        // TODO : question depth 추가 시 활용
        // const rootCategoryId =
        //   Utility.getRootCategoryFromChildCategory(question.categoryID);
        // console.log('rootCategoryId', rootCategoryId);

        const category = categories[question.categoryID];
        mapOfWish[category.parent].push(question);
      })

      console.log("mapOfWish", mapOfWish);

      return {
        data: mapOfWish
      }

    }
  },

  "GET /question/pagination/:selectedPage/:showCount": {
    middlewares: ["auth"],
    async handler(req, rep) {
      let selectedPage = parseInt(req.params.selectedPage);
      let showCount = parseInt(req.params.showCount);

      if (isNaN(selectedPage) || selectedPage === 0 || isNaN(showCount) || showCount === 0) {
        const error = new Error();
        if (isNaN(selectedPage)) error.message = "page is NaN";
        if (selectedPage === 0) error.message = "page is 0";
        if (isNaN(showCount)) error.message = "showCount is NaN";
        if (showCount === 0) error.message = "showCount is 0";
        error.status = 400;
        return error;
      }

      const questionCol = Database.sharedInstance().getCollection("question");
      const questions = Object.values(questionCol["$dataset"]);

      const maxPage = Math.ceil(questions.length / showCount);
      const isLast = questions.length < showCount * selectedPage;

      if (maxPage < selectedPage) {
        const error = new Error("page is over");
        error.status = 400;
        return error;
      }

      const endNum = isLast ? questions.length : showCount * selectedPage;
      const startNum = isLast ? endNum - questions.length % showCount : endNum - showCount;
      const returnValue = questions.slice(startNum, endNum);

      return {
        maxPage: maxPage,
        totalQuestionCount: questions.length,
        getQuestionCount: endNum - startNum,
        data: returnValue,
      };

    }
  }
};
