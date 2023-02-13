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
      const getTypeArr = typeCol.get(title) ?? typeCol.set(title, [data]);

      // TODO : 중복된 데이터가 있는지 체크(없으면 null, 있으면 해당 data)
      const getType = getTypeArr.find(function (inTypeData) {
        return data === inTypeData;
      });

      // TODO : 중복된 데이터가 있으면 error를 반환
      if (getType !== undefined) {
        const error = new Error("already has data");
        error.status = 403;
        return error;
      }

      // TODO : 중복된 데이터가 없으면 col에 set
      if (getType === undefined) {
        getTypeArr.push(data);
        typeCol.set(title, getTypeArr);
      }

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