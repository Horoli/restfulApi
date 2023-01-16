module.exports = async (req, rep) => {
  const { token } = req.headers;

  // TODO : token DB 쿼리
  const tokenInfo = undefined;

  if (!token || !tokenInfo) {
    const error = new Error("not permitted");
    error.status = 403;
    return error;
  }

  req.token = tokenInfo;
};
