const Database = require("../datebase");

module.exports = {
    "POST /subcategory": {
        middlewares: ["auth"],
        async handler(req, rep) {
            // TODO : mainCategory를 List<String>으로 저장
            const title = "subcategory";
            const data = req.body[title];

            const subCategoryCol = Database.sharedInstance().getCollection(title);

            // TODO : mainCategoryCol이 있으면 List로 가져오고, 없으면 빈 값(파일) 생성
            const getSubCategoryArr = subCategoryCol.get(title) ?? subCategoryCol.set(title, [data]);


            // TODO : 중복된 데이터가 있는지 체크(없으면 null, 있으면 해당 data)
            const getSubCategory = getSubCategoryArr.find(function (inCategoryData) {
                return data === inCategoryData;
            });

            // TODO : 중복된 데이터가 있으면 error를 반환 
            if (getSubCategory !== undefined) {
                const error = new Error("already has data");
                error.status = 403;
                return error;
            }
            // if (getMainCategory !== undefined) {
            //     const cateLength = getMainCategoryArr.length;
            //     if (cateLength === 1) {
            //         return {
            //             status: 200,
            //             data: { maincategory: getMainCategoryArr },
            //         }
            //     }
            //     const error = new Error("already has data");
            //     return error;
            // }

            // TODO : 중복된 데이터가 없으면 col에 set
            if (getSubCategory === undefined) {
                // set하기 전 data를 Arr에 추가
                getSubCategoryArr.push(data);
                subCategoryCol.set(title, getSubCategoryArr);
            }

            return {
                status: 200,
                data: { subcategory: getSubCategoryArr },
            };
        },
    },
};
