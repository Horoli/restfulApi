const Crypto = require("crypto");
const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  "POST /signup": {
    async handler(req, rep) {
      const { id, pw } = req.body;

      const usersCol = Database.sharedInstance().getCollection("users");
      //
      if (usersCol.get(id) !== undefined) {
        const error = new Error("has User");
        error.status = 400;
        return error;
      }
      //
      usersCol.set(id, { pw: pw });

      return { statusCode: 200, data: { ok: "ok" } };
    },
  },

  "POST /login": {
    async handler(req, rep) {
      const { id, pw } = req.body;

      const usersCol = Database.sharedInstance().getCollection("users");
      const tokensCol = Database.sharedInstance().getCollection("tokens");

      // TODO : DB 접근해서 password 일치하는지 비교
      console.log(usersCol);
      const userPw = usersCol.get([id, "pw"]);

      if (userPw === undefined) {
        const error = new Error("user not exists");
        error.status = 400;
        return error;
      }

      // TODO : 불일치 시 에러 발생 후 리턴
      if (pw !== userPw) {
        const error = new Error("invalid password");
        error.status = 400;
        return error;
      }

      // TODO : 로그인을 시도한 id에 할당된 토큰이 있으면 전부 삭제
      const keysTokensCol = Object.keys(tokensCol["$dataset"]);

      for (i = 0; i < keysTokensCol.length; i++) {
        const token = keysTokensCol[i];
        const getId = tokensCol.get([token, "id"]);
        const getExpireAt = tokensCol.get([token, "expireAt"]);
        const compareDate = Date.now() - getExpireAt;
        if (id === getId) tokensCol.del(token);
        if (compareDate > 0) tokensCol.del(token);
      }

      // TODO : 토큰 생성 후 토큰 및 유저정보 DB에 저장
      const token = Utility.UUID();
      tokensCol.set(token, {
        id,
        // 토큰 유효기간 : 30분
        expireAt: Date.now() + 1 * 30 * 60 * 1000,
        // expireAt: Date.now() + 24 * 60 * 60 * 1000, // 24시간
      });

      return {
        statusCode: 200,
        data: {
          // TODO : id, expireAt을 뿌려줘야함
          token,
        },
      };
    },
  },
};
