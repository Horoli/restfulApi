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
  const compareDate = Date.now() - tokenInfo.expireAt;
  console.log(compareDate);

  console.log("step 1");
  if (tokenInfo === undefined) {
    const error = new Error("Not permitted");
    error.status = 403;
    return error;
  } else if (compareDate > 0) {
    tokensCol.del(token);
    const error = new Error("Token expired");
    error.status = 403;
    return error;
  }

  console.log("step 2");

  req.token = tokenInfo;
  req.user = usersCol.get(tokenInfo.id);
};
