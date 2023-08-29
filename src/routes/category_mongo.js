const MongoDB = require("../mongodb");
const Utility = require("../utility");

module.exports = {
  "GET /mongo_category": {
    middlewares: ["mongo_auth"],
    async handler(req, rep) {
      const { parent, id } = req.query;

      const mainCategoryCol = await MongoDB.getCollection("mainCategory");
      const subCategoryCol = await MongoDB.getCollection("subCategory");

      const mainFindResult = await mainCategoryCol.find().toArray();
      const subFindResult = await subCategoryCol.find().toArray();

      const convertMainCategory = mainFindResult.reduce((newObj, obj) => {
        newObj[obj.key] = obj.value;
        return newObj;
      }, {});

      const convertSubCategory = subFindResult.reduce((newObj, obj) => {
        newObj[obj.id] = obj;
        return newObj;
      });

      // TODO : subCategory getById
      if (id !== undefined && parent === undefined) {
        const getData = await subCategoryCol.findOne({ id: id });

        console.log("id", id);
        console.log("getData", getData);

        return {
          status: 200,
          data: getData,
        };
      }

      // TODO : 입력된 parent가 없으면 mainCategories를 return
      if (parent === undefined && id === undefined) {
        return {
          status: 200,
          data: convertMainCategory,
        };
      }

      const getSubCategories = await subCategoryCol
        .find({ parent: parent })
        .toArray();

      return {
        status: 200,
        data: getSubCategories,
      };
    },
  },
  // TODO : subCategoryCol에 있는 모든 데이터를 가져옴
  "GET /mongo_subcategory": {
    middlewares: ["mongo_auth"],
    async handler(req, rep) {
      const { map } = req.query;
      console.log("map", map);

      const subCategoryCol = await MongoDB.getCollection("subCategory");
      const getData = await subCategoryCol.find().toArray();
      if (map === undefined) {
        // returnType = List;
        return {
          status: 200,
          data: getData,
        };
      }

      const convertSubCategory = getData.reduce((newObj, obj) => {
        newObj[obj.id] = obj;
        return newObj;
      }, {});

      // return type = Map;
      return {
        status: 200,
        data: convertSubCategory,
      };
    },
  },

  "POST /mongo_category": {
    middlewares: ["mongo_auth"],
    async handler(req, rep) {
      const { parent, name } = req.body;

      // TODO : parent, name이 없으면 error
      if (parent === undefined || name === undefined) {
        const error = new Error("please check your input");
        error.status = 400;
        return error;
      }

      const subCategoryCol = await MongoDB.getCollection("subCategory");

      const categoryModel = {
        id: Utility.UUID(true),
        parent: parent,
        children: [],
        name: name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await subCategoryCol.insertOne(categoryModel);

      const get = await subCategoryCol.updateOne(
        { id: parent },
        { $push: { children: categoryModel.id } }
      );
      console.log("get", get);
      return {
        status: 200,
        data: [],
      };
    },
  },

  "DELETE /mongo_category": {
    middlewares: ["mongo_auth"],
    async handler(req, rep) {
      // TODO : 삭제할 category의 id를 입력 받음
      const { id: targetId } = req.body;
      if (targetId === undefined) {
        const error = new Error("please check your input");
        error.status = 400;
        return error;
      }
      const subCategoryCol = await MongoDB.getCollection("subCategory");

      // TODO : 삭제할 data를 가져옴
      const targetData = await subCategoryCol.findOne({ id: targetId });

      if (targetData === null) {
        console.log("targetData", targetData);
        const error = new Error("target is not exists");
        error.status = 400;
        return error;
      }

      // TODO : 삭제할 데이터의 parent 데이터를 가져와서
      // children<Array>에 포함된 targetId를 삭제함
      await subCategoryCol.findOneAndUpdate(
        { id: targetData.parent },
        { $pull: { children: { $in: [targetId] } } }
      );
      console.log("update");
      await subCategoryCol.deleteOne({ id: targetId });
      console.log("delete");

      return {
        status: 200,
        message: `${targetId} is deleted`,
      };
    },
  },
};
