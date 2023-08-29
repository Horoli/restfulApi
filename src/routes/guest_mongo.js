
const MongoDB = require("../mongodb");
const Utility = require("../utility");
const guest = require("./guest");

module.exports = {
    "POST /mongo_guest": {
        // middlewares: ["mongo_auth"],
        async handler(req, rep) {
            const id = req.body.id.replace(/-/g, "");

            if (!id.length > 10) {
                const error = new Error("bad id");
                error.status = 400;
                return error;
            }

            const guestCol = await MongoDB.getCollection("guest");

            const guestInfo = await guestCol.findOne({ id: id });

            if (guestInfo === null) {
                await guestCol.insertOne({
                    id: id,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    currectQuestion: [],
                    wrongQuestion: [],
                    wishQuestion: [],
                });
                return {
                    statusCode: 200,
                    data: {
                        id: id,
                    }
                }
            }
            return {
                statusCode: 200,
                data: await guestCol.findOne({ id: id })
            }
        }
    },
    "POST /mongo_guestlogin": {
        // middlewares: ["mongo_auth"],
        async handler(req, rep) {
            const id = req.body.id.replace(/-/g, "");

            const guestCol = await MongoDB.getCollection("guest");
            const tokensCol = await MongoDB.getCollection("tokens");

            if (!id.length > 10) {
                const error = new Error("bad id");
                error.status = 400;
                return error;
            }

            const guestInfo = guestCol.findOne({ id: id });
            if (guestInfo === null) {
                const error = new Error("guest not exists");
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
    },

    "PATCH /mongo_guest": {
        middlewares: ["mongo_auth"],
        async handler(req, rep) {
            const { id, wishQuestion } = req.body;

            if (id === undefined) {
                const error = new Error("mongo_guest id is undefined");
                error.status = 400;
                return error;
            }

            const guestCol = await MongoDB.getCollection("guest");
            await guestCol.updateOne({ id: id }, { $set: { wishQuestion: wishQuestion } });

            const guestInfo = await guestCol.findOne({ id: id });
            console.log(guestInfo);

            return {
                statusCode: 200,
                data: guestInfo,
            }
        }

    }

}