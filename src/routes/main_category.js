const Database = require("../datebase");

module.exports = {
    "POST /maincategory": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const id = "id";
            const type = "type";
            const maincategory = "maincategory";

            const titleData = req.body[maincategory];
            const typeData = req.body[type];
            const idData = req.body[id].replace(/-/g, "");
            duplicateCheck = false;

            const mainCategoryCol =
                Database.sharedInstance().getCollection(maincategory);

            const mainColValues = Object.values(mainCategoryCol["$dataset"]);
            console.log("objValues", mainColValues);

            // TODO : keys를 돌면서 type이 중복되는지 체크
            mainColValues.forEach(function (value) {
                // TODO : 중복된 데이터가 있으면 duplicateCheck를 true로
                if (value[maincategory] === titleData) {
                    duplicateCheck = true;
                }
            });

            // TODO : 중복된 데이터가 있으면 error return
            if (duplicateCheck === true) {
                const error = new Error("this mainCategory already has data");
                error.status = 403;
                return error;
            }

            if (duplicateCheck !== true) {
                mainCategoryCol.set(idData, {
                    id: idData,
                    type: typeData,
                    maincategory: titleData,
                });
            }

            return {
                status: 200,
                data: mainCategoryCol["$dataset"],
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
                data: mainCategoryCol["$dataset"],
            };
        },
    },
};
