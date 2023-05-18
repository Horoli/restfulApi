const Crypto = require("crypto");
const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  "POST /guest": {
    async handler(req, rep) {
      const id = req.body.id.replace(/-/g, "");

      // if (id.length !== 32) {
      if (!id.length > 10) {
        const error = new Error("bad id");
        error.status = 400;
        return error;
      }
      const guestCol = Database.sharedInstance().getCollection("guest");

      if (guestCol.get(id) === undefined) {
        return {
          statusCode: 200,
          data: guestCol.set(id, {
            id: id,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            currectQuestion: [],
            wrongQuestion: [],
            wishQuestion: [],
          }),
        };
      }

      return {
        statusCode: 200,
        data: guestCol.get(id),
      };
    },
  },

  "POST /guestlogin": {
    async handler(req, rep) {
      const id = req.body.id.replace(/-/g, "");

      console.log("id", id);

      const guestCol = Database.sharedInstance().getCollection("guest");
      const tokensCol = Database.sharedInstance().getCollection("tokens");

      // if (id.length !== 32) {

      if (!id.length > 10) {
        const error = new Error("bad id");
        error.status = 400;
        return error;
      }

      const guest = guestCol.get(id);
      if (guest === undefined) {
        const error = new Error("guest not exists");
        error.status = 400;
        return error;
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

  "PATCH /guest": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id, wishQuestion } = req.body;

      const guestCol = Database.sharedInstance().getCollection("guest");

      const guestInfo = guestCol.get(id);
      guestInfo.wishQuestion = wishQuestion;
      // guestCol.set(id, {
      //   id:id,

      //       createdAt: Date.now(),
      //       updatedAt: Date.now(),
      //       currectQuestion: [],
      //       wrongQuestion: [],
      //   wishQuestion: wishQuestion,
      // });

      return {
        statusCodee: 200,
        data: guestInfo,
      };
    },
  },

  "GET /guest": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id } = req.query;
      // const convertId = id.replace(/-/g, "");
      const guestCol = Database.sharedInstance().getCollection("guest");

      return {
        status: 200,
        data: guestCol.get(id),
      };
    },
  },
};
