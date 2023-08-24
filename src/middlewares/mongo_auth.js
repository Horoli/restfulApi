const MongoDB = require("../mongodb");

module.exports = async (req, rep) => {
    const { token } = req.headers;

    const tokensCol = await MongoDB.getCollection("tokens");
    const usersCol = await MongoDB.getCollection("users");

    if (!token) {
        const error = new Error("Not permitted");
        error.status = 403;
        return error;
    }

    const tokenInfo = tokensCol.findOne({ token: token });

    console.log("step 1");
    if (tokenInfo === undefined) {
        const error = new Error("Not permitted");
        error.status = 403;
        return error;
    } else if (Date.now() - tokenInfo.expireAt > 0) {
        await tokensCol.deleteOne({ token: token });
        const error = new Error("Token expired");
        error.status = 403;
        return error;
    }


    tokenInfo.expireAt = Date.now() + 1 * 30 * 60 * 1000;

    req.token = tokenInfo;
    req.user = usersCol.findOne({ id: tokenInfo.id });
}


