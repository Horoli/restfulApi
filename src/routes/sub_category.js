const Database = require("../datebase");

module.exports = {
  "POST /subcategory": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const id = "id";
      const maincategory = "maincategory";
      const subcategory = "subcategory";

      const titleData = req.body[subcategory];
      const idData = req.body[id].replace(/-/g, "");
      const maincategoryData = req.body[maincategory];
      duplicateCheck = false;

      const subCategoryCol =
        Database.sharedInstance().getCollection(subcategory);

      const objValues = Object.values(subCategoryCol["$dataset"]);
      console.log("objValues", objValues);

      // TODO : keys를 돌면서 type이 중복되는지 체크
      objValues.forEach(function (value) {
        // TODO : 중복된 데이터가 있으면 duplicateCheck를 true로
        if (value[subcategory] === titleData) {
          duplicateCheck = true;
        }
      });

      // TODO : 중복된 데이터가 있으면 error return
      if (duplicateCheck === true) {
        const error = new Error("this subCategory already has data");
        error.status = 403;
        return error;
      }

      if (duplicateCheck !== true) {
        subCategoryCol.set(idData, {
          id: idData,
          maincategory: maincategoryData,
          subcategory: titleData,
        });
      }

      return {
        status: 200,
        data: subCategoryCol["$dataset"],
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
        data: subCategoryCol["$dataset"],
      };
    },
  },
};
