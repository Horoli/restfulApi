const MongoDB = require("../mongodb");
const Utility = require("../utility");

module.exports = {
    "POST /mongo_sign_up": {
        middlewares: ["mongo_auth"],
        async handler(req, rep) {
            const { id, pw } = req.body;

            const usersCol = await MongoDB.getCollection("users");
            const getUser = await usersCol.findOne({ id: id });
            if (getUser !== null) {
                const error = new Error("has User");
                error.status = 400;
                return error;
            }

            await usersCol.insertOne({ id: id, pw: pw });
            return {
                statusCode: 200,
                message: "sign up success"
            }
        }
    },

    "POST /mongo_login": {
        // middlewares: ["mongo_auth"],
        async handler(req, rep) {
            const { id, pw } = req.body;
            const usersCol = await MongoDB.getCollection("users");
            const tokensCol = await MongoDB.getCollection("tokens");

            const userInfo = await usersCol.findOne({ id: id });

            if (userInfo === null) {
                const error = new Error("user not exists");
                error.status = 400;
                return error;
            }

            if (userInfo.pw !== pw) {
                const error = new Error("invalid password");
                error.status = 400;
                return error;
            }

            const getTokensById = await tokensCol.find({ id: id }).toArray();
            console.log("getTokens", getTokensById);

            // TODO : 최초 로그인에는 실행되지 않음
            if (getTokensById.length > 0) {
                for (const inToken in getTokensById) {
                    await tokensCol.deleteOne({ id: id });
                }
            }

            const newToken = Utility.UUID();
            await tokensCol.insertOne({
                id: id,
                token: newToken,
                expireAt: Date.now() + 1 * 30 * 60 * 1000,
            })

            return {
                statusCode: 200,
                data: {
                    token: newToken,
                }
            }


        }

    }

}