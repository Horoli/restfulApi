const Database = require("../datebase");

module.exports = {
  "POST /type": {
    middlewares: ["auth"],
    async handler(req, rep) {
      // TODO : type을 List<String>으로 저장
      const title = "type";
      const data = req.body[title];

      const typeCol = Database.sharedInstance().getCollection(title);

      // TODO : mainCategoryCol이 있으면 List로 가져오고, 없으면 빈 값(파일) 생성
      const getTypeArr = typeCol.get(title);

      // db가 없으면 set하고 return
      if (getTypeArr === undefined) {
        typeCol.set(title, [data]);
        return {
          status: 200,
          data: { type: typeCol.get(title) },
        };
      }

      // TODO : 중복된 데이터가 있는지 체크(없으면 null, 있으면 해당 data)
      const getType = getTypeArr.find((type) => type === data);

      // TODO : 중복된 데이터가 있으면 error를 반환
      if (getType !== undefined) {
        const error = new Error("already has data");
        error.status = 403;
        return error;
      }

      // TODO : 중복된 데이터가 없으면 col에 set
      getTypeArr.push(data);
      typeCol.set(title, getTypeArr);

      return {
        status: 200,
        data: { type: getTypeArr },
      };
    },
  },

  "DELETE /type": {
    middlewares: ["auth"],
    async handler(req, rep) {
      // TODO : type을 List<String>으로 저장
      const title = "type";
      const data = req.body[title];
      // console.log(data);

      const typeCol = Database.sharedInstance().getCollection(title);

      // TODO : mainCategoryCol이 있으면 List로 가져오고, 없으면 빈 값(파일) 생성
      const getTypeArr = typeCol.get(title);
      // console.log("getTypeArr", getTypeArr);

      // db가 없으면 error return
      if (getTypeArr === undefined) {
        const error = new Error("has no data");
        error.status = 403;
        return error;
      }

      // TODO : 중복된 데이터가 있는지 체크(없으면 -1, 있으면 해당 data)
      const getType = getTypeArr.findIndex((type) => type === data);
      console.log("getType", getType);

      // TODO : 중복된 데이터가 없으면 error를 반환
      if (getType === -1) {
        const error = new Error("has no data");
        error.status = 403;
        return error;
      }

      // TODO : 중복된 데이터가 있으면 col에서 del
      getTypeArr.splice(getType, 1);
      console.log("getTypeArr", getTypeArr);
      typeCol.set(title, getTypeArr);

      return {
        status: 200,
        data: { type: getTypeArr },
      };
    },
  },

  "GET /type": {
    async handler(req, rep) {
      const title = "type";
      const typeCol = Database.sharedInstance().getCollection(title);

      const getTypeArr = typeCol.get(title);

      return {
        status: 200,
        data: { type: getTypeArr },
      };
    },
  },
};
