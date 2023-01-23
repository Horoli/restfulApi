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

  if (!tokenInfo) {
    const error = new Error("Not permitted");
    error.status = 403;
    return error;
  } else if (Date.now() - tokenInfo.expireAt > 0) {
    tokensCol.del(token);
    const error = new Error("Token expired");
    error.status = 403;
    return error;
  }

  req.token = tokenInfo;
  req.user = usersCol.get(tokenInfo.id);
};
