const Crypto = require("crypto");
const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  // TODO : 맞춘 문제, 틀린 문제에 대한 정보를 저장하기 위해 guest 계정 생성
  // TODO : 앱에서만 실행 할 수 있도록 middleWare 추가??
  "POST /guest": {
    async handler(req, rep) {
      const id = req.body.id.replace(/-/g, "");

      if (id.length !== 32) {
        const error = new Error("bad id");
        error.status = 400;
        return error;
      }
      console.log("id", id);

      //   const id = Crypto.randomUUID().replace(/-/g, "");
      const guestCol = Database.sharedInstance().getCollection("guest");
      const tokensCol = Database.sharedInstance().getCollection("tokens");

      if (guestCol.get(id) === undefined) {
        return {
          statusCode: 200,
          data: guestCol.set(id, {
            id: id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            currectQuestion: [],
            wrongQuestion: [],
          }),
        };
      }

      const keysTokensCol = Object.keys(tokensCol["$dataset"]);

      for (i = 0; i < keysTokensCol.length; i++) {
        const token = keysTokensCol[i];
        const getId = tokensCol.get([token, "id"]);
        const getExpireAt = tokensCol.get([token, "expireAt"]);
        const compareDate = Date.now() - getExpireAt;
        if (id === getId) tokensCol.del(token);
        if (compareDate > 0) tokensCol.del(token);
      }

      const token = Utility.UUID(true);
      tokensCol.set(token, {
        id,
        expireAt: Date.now() + 1 * 30 * 60 * 1000,
      });

      return {
        statusCode: 200,
        data: {
          token,
        },
      };
    },
  },

  "GET /guest": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id } = req.query;
      const convertId = id.replace(/-/g, "");
      const guestCol = Database.sharedInstance().getCollection("guest");

      return {
        status: 200,
        data: guestCol.get(convertId),
      };
    },
  },
};
