const Database = require("../datebase");

module.exports = {
    "POST /maincategory": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const title = "maincategory";
            const type = "type";
            const id = "id";

            const titleData = req.body[title];
            const typeData = req.body[type];
            const idData = req.body[id];
            duplicateCheck = false;
            console.log('duplicateCheck', duplicateCheck);

            const mainCategoryCol = Database.sharedInstance().getCollection(title);

            const objValues = Object.values(mainCategoryCol['$dataset']);
            console.log('objValues', objValues);

            // TODO : keys를 돌면서 type이 중복되는지 체크
            objValues.forEach(function (value) {
                // TODO : 중복된 데이터가 있으면 duplicateCheck를 true로
                if (value[title] === titleData) {
                    duplicateCheck = true;
                }
            });

            // TODO : 중복된 데이터가 있으면 error return
            if (duplicateCheck === true) {
                const error = new Error("already has data");
                error.status = 403;
                return error;
            }

            if (duplicateCheck !== true) {
                mainCategoryCol.set(idData, { id: idData, type: typeData, maincategory: titleData });
            }

            return {
                status: 200,
                data: mainCategoryCol["$dataset"],
                // data: { maincategory: getMainCategoryArr },
            };
        },
    },


    //
    "GET /maincategory": {
        // middlewares: ["auth"],
        async handler(req, rep) {

            const title = "maincategory";
            const mainCategoryCol = Database.sharedInstance().getCollection(title);
            return {
                status: 200,
                header: {},
                data: { maincategory: mainCategoryCol.get(title) }
            };
        },
    },
};
