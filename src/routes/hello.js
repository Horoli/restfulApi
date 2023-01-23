module.exports = {
  "POST /hello": {
    async handler(req, rep) {
      return {
        data: "ok",
      };
    },
  },
  "GET /hello": {
    middlewares: ["auth"],
    async handler(req, rep) {
      return {
        data: "ok",
      };
    },
  },
};
