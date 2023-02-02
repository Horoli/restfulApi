const Database = require("../datebase");

module.exports = async (req, rep) => {
  const { token } = req.headers;
  console.log("token", token);

  const tokensCol = Database.sharedInstance().getCollection("tokens");
  const usersCol = Database.sharedInstance().getCollection("users");

  if (!token) {
    const error = new Error("Not permitted");
    error.status = 403;
    return error;
  }

  const tokenInfo = tokensCol.get(token);
  console.log("tokenInfo", tokenInfo);

  console.log("step 1");
  if (tokenInfo === undefined) {
    const error = new Error("Not permitted");
    error.status = 403;
    return error;
  } else if (Date.now() - tokenInfo.expireAt > 0) {
    tokensCol.del(token);
    const error = new Error("Token expired");
    error.status = 403;
    return error;
  }

  console.log("step 2");
  // 토큰 유효기간 30분 추가
  tokenInfo.expireAt = Date.now() + 1 * 30 * 60 * 1000;
  // tokenInfo.expireAt = Date.now() + 24 * 60 * 60 * 1000; // 24시간

  req.token = tokenInfo;
  req.user = usersCol.get(tokenInfo.id);
};
