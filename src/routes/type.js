const Database = require("../datebase");

module.exports = {
  "POST /type": {
    middlewares: ["auth"],
    async handler(req, rep) {
      // TODO : type을 List<String>으로 저장
      const { type } = req.body;

      const title = "type";
      const typeCol = Database.sharedInstance().getCollection("type");

      const getTypeArr = typeCol.get(title);
      const getType = getTypeArr.find(function (typeData) {
        return typeData === type;
      });
      console.log("getTypeArr", getTypeArr);
      console.log("getType", getType);

      if (getTypeArr === undefined) {
        typeCol.set(title, [type]);
      } else if (getType === undefined) {
        getTypeArr.push(type);
        typeCol.set(title, getTypeArr);
      }

      return {
        status: 200,
        data: getTypeArr,
      };
    },
  },
};
