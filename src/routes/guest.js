const Crypto = require("crypto");
const Database = require("../datebase");

module.exports = {
  // TODO : 맞춘 문제, 틀린 문제에 대한 정보를 저장하기 위해 guest 계정 생성
  // TODO : 앱에서만 실행 할 수 있도록 middleWare 추가??
  "POST /guest": {
    async handler(req, rep) {
      const id = req.body.id.replace(/-/g, "");
      console.log("id", id);

      //   const id = Crypto.randomUUID().replace(/-/g, "");
      const guestCol = Database.sharedInstance().getCollection("guest");

      if (guestCol.get(id) !== undefined) {
        const error = new Error("already initialized");
        error.status = 400;
        return error;
      }

      guestCol.set(id, {
        id: id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currectQuestion: [],
        wrongQuestion: [],
      });

      return {
        statusCode: 200,
        data: guestCol.get(id),
      };
    },
  },


  "GET /guest": {
    // middlewares: ["auth"],
    async handler(req, rep) {

      const title = "guest";
      const guestCol = Database.sharedInstance().getCollection(title);
      console.log(guestCol['$dataset']);
      return {
        status: 200,
        header: {},
        data: { guest: guestCol['$dataset'] }
      };
    },
  },
};
