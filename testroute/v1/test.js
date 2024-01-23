const Database = require("../../datebase");

module.exports = {
    "POST /type": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const { type } = req.body

            const typeCol = Database.sharedInstance().getCollection("type")

            const typeExists = !!typeCol.get(type)
            if (typeExists) {
                const error = new Error("already has data")
                error.status = 403
                return error
            }

            return {
                status: 200,
                data: typeCol.set(type, {
                    categories: [],
                    parents: [],
                    child: [],
                    createdAt: Date.now(),
                    updatedat: Date.now()
                })
            }
        }
    },
    "GET /": {
        middlewares: [],
        async handler(req, rep) {
            return {
                statusCode: 200,
                data:'',
            }
        }
    }
}