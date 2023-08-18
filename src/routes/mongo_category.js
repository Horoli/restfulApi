const MongoDB = require("../mongodb");
const Utility = require("../utility");

module.exports = {
  "GET /mongo_category": {
    async handler(req, rep) {
      const { parent, id } = req.query;

      const categoryCol = await MongoDB.getCollection("category");

      const findResult = await categoryCol.find().toArray();

      console.log(await categoryCol.find({ subcategory: {} }, {}).toArray());

      console.log("findResult", findResult);
      // const insert = await mainCategories.insertOne({ zzz: "zzzz" });
      // const find = await mainCategories.find().toArray();
      // console.log(find);

      return {
        status: 200,
        data: [],
      };
    },
  },
  "POST /mongo_category": {
    async handler(req, rep) {
      const { parent, name } = req.body;

      const categoryCol = await MongoDB.getCollection("category");

      let parentIsSubCategory = false;

      // mainCategories는 categoryCol의 0번째에 저장되어있기 때문에 findOne을 사용
      const mainCategories = await categoryCol.findOne({});
      console.log("mainCategories", mainCategories);

      const parentExists = !!Object.keys(mainCategories.mainCategories).find(
        (e) => e == parent
      );

      if (!parentExists) {
        parentIsSubCategory = true;
        const asd = await categoryCol.find().toArray();
        console.log("asd", asd);
      }

      const categoryModel = {
        id: Utility.UUID(true),
        parent,
        children: [],
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      console.log(await categoryCol.find().toArray());

      return {
        status: 200,
        data: [],
      };
    },
  },
};
