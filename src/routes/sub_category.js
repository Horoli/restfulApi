const Database = require("../datebase");

module.exports = {
    "POST /subcategory": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const title = "subcategory";
            const data = req.body[title];
            const subCategoryCol = Database.sharedInstance().getCollection(title);

            return {
                status: 200,
                data: "ok",
            };
        },
    },

    "GET /subcategory": {
        // middlewares: ["auth"],
        async handler(req, rep) {

            const title = "subcategory";
            const subCategoryCol = Database.sharedInstance().getCollection(title);
            return {
                status: 200,
                header: {},
                data: "ok",
            };
        },
    },
};
