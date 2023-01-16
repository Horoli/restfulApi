const Crypto = require("crypto");
const Database = require("../datebase");

module.exports = {
  "POST /login": {
    async handler(req, rep) {
      const { id, pw } = req.body;

      // TODO : DB 접근 후 password 일치 여부 확인
      Database.sharedInstance().getCollection("users").get(id);

      // TODO : 불일치 시 에러 발생 후 리턴
      if (pw !== "ddddd") {
        const error = new Error("invalid password");
        error.status = 400;
        return error;
      }
      const token = Crypto.randomUUID().replace(/-/g, "");
      Database.sharedInstance().set("tokens", {});

      // TODO : 토큰, 및 유저 정보 DB에 입력

      return {
        statusCode: 200,
        data: {
          token,
        },
      };
    },
  },
};
