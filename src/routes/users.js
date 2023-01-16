const Crypto = require("crypto");
const { join } = require("path");
const Database = require("../datebase");

module.exports = {
  "POST /join": {
    async handler(req, rep) {
      const { id, pw } = req.body;
      const joinUser = Database.sharedInstance().getCollection("users");

      // DB 접근해서 set함수 실행해서 저장
      joinUser.set("id", id);
      joinUser.set("pw", pw);

      console.log(joinUser);

      return {
        statusCode: 200,
        data: {},
      };
    },
  },

  "POST /login": {
    async handler(req, rep) {
      const { id, pw } = req.body;
      console.log(id);
      console.log(pw);

      // TODO : DB 접근 후 password 일치 여부 확인
      console.log("step 1");
      const userInfo = Database.sharedInstance().getCollection("users");

      console.log(`step 2 : ${userInfo.$dataset}`);
      console.log(`step 3 : ${userInfo.get(id)}`);

      // TODO : 불일치 시 에러 발생 후 리턴
      if (pw !== "ddddd") {
        const error = new Error("invalid password");
        error.status = 400;
        return error;
      }
      const token = Crypto.randomUUID().replace(/-/g, "");
      userInfo.set("tokens", {});

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
