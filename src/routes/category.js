const Database = require("../datebase");
const Utility = require("../utility");

module.exports = {
  "GET /category": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { parent, id } = req.query;

      const categoryCol = Database.sharedInstance().getCollection("category");
      console.log("id", id === undefined);
      console.log("parent", parent === undefined);

      if (id !== undefined && parent === undefined) {
        return {
          status: 200,
          data: categoryCol.get("subCategories")[id],
        };
      }

      // TODO : 입력된 parent가 없으면 mainCategories를 return
      if (parent === undefined && id == undefined) {
        return {
          status: 200,
          data: categoryCol.get("mainCategories"),
        };
      }

      const subCategory = Object.values(categoryCol.get("subCategories") ?? {});
      // console.log("subCategory", subCategory);
      return {
        status: 200,
        data: subCategory.filter((category) => category.parent === parent),
      };
    },
  },

  // TODO : subCategoryCol에 있는 모든 데이터를 가져옴
  "GET /subcategory": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { map } = req.query;
      console.log("map", map);

      const categoryCol = Database.sharedInstance().getCollection("category");
      console.log("categoryCol", categoryCol.get("subCategories"));
      if (map === undefined) {
        return {
          status: 200,
          data: Object.values(categoryCol.get("subCategories")),
        };
      }
      return {
        status: 200,
        data: categoryCol.get("subCategories"),
      };
    },
  },
  // TODO : question을 생성할때 children이 없는 category를 사용해야하기 때문에
  // children이 없는 category를 get
  "GET /nochildrencategory": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const categoryCol = Database.sharedInstance().getCollection("category");
      const subCategory = Object.values(categoryCol.get("subCategories") ?? {});
      console.log("subCategory", subCategory);

      return {
        status: 200,
        data: subCategory.filter((category) => category.children.length == 0),
      };
    },
  },
  "POST /category": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { parent, name } = req.body;

      // TODO : 카테고리 추가 할때 name이 입력되지 않으면 error return
      if (name === "") {
        const error = new Error("name is Not exists");
        error.status = 403;
        return error;
      }

      const categoryCol = Database.sharedInstance().getCollection("category");

      let parentIsSubCategory = false;
      // let parentExists = !!categoryCol.get(`mainCategories.${parent}`)
      // 입력된 parent가 mainCategories에 포함되어 있으면 false
      let parentExists = !!categoryCol.get(`mainCategories.${parent}`);

      console.log(categoryCol.get(`mainCategories.${parent}`));
      console.log(!categoryCol.get(`mainCategories.${parent}`));
      console.log(!!categoryCol.get(`mainCategories.${parent}`));

      // console.log(!categoryCol.get(`mainCategories.${parent}`))
      // console.log(parentExists, parentExists);

      if (!parentExists) {
        // if (parentExists === undefined) {
        parentIsSubCategory = true;
        parentExists = !!categoryCol.get(`subCategories.${parent}`);
        console.log("exist 2", parentExists);
        // console.log('test', categoryCol.get(`subCategories.${parent}`));

        const getValue = Object.values(categoryCol.get("subCategories"));
        const get = getValue.filter(
          (subcategory) => subcategory.parent === parent
        );
        console.log(get);
      }

      if (!parentExists) {
        const error = new Error("Parent id is Not exists");
        error.status = 403;
        return error;
      }

      const categoryModel = {
        id: Utility.UUID(true),
        parent,
        children: [],
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      if (parentIsSubCategory) {
        const parentCategory = categoryCol.get(`subCategories.${parent}`);
        // console.log('parentCategory', parentCategory)
        parentCategory.children.push(categoryModel.id);
        categoryCol.set(`subCategories.${parent}`, parentCategory);
      }

      return {
        status: 200,
        data: categoryCol.set(
          `subCategories.${categoryModel.id}`,
          categoryModel
        ),
      };
    },
  },
  "PATCH /category": {
    middlewares: ["auth"],
    async handler(req, rep) {},
  },
  "DELETE /category": {
    middlewares: ["auth"],
    async handler(req, rep) {
      const { id } = req.body;

      const categoryCol = Database.sharedInstance().getCollection("category");
      const questionCol = Database.sharedInstance().getCollection("question");

      const questions = Object.values(questionCol["$dataset"]);

      // TODO : category를 삭제하면 해당 category의 id를 가지고 있는 question의
      // categoryID를 초기화 해줌
      // TODO : 향후 question
      const filteredQuestion = questions.filter(
        (question) => question.categoryID === id
      );
      for (var index = 0; index < filteredQuestion.length; index++) {
        questionCol["$dataset"][filteredQuestion[index].id].categoryID = "";
        console.log("questionCol['$dataset]", questionCol["$dataset"]);
      }

      const category = categoryCol.get(`subCategories.${id}`);
      if (category === undefined) {
        const error = new Error("Category is Not exists");
        error.status = 403;
        return error;
      }

      if (category.parent) {
        const parentCategory = categoryCol.get(
          `subCategories.${category.parent}`
        );
        if (parentCategory) {
          const idx = parentCategory.children.indexOf(id);
          if (idx === -1) {
            parentCategory.children.splice(idx, 1);
            categoryCol.set(`subCategories.${category.parent}`, parentCategory);
          }
        }
      }

      if (category.children.length > 0) {
        const deleteChildrenIds = [];
        const targets = [...category.children];
        while (targets.length > 0) {
          const childId = targets.pop();
          deleteChildrenIds.push(childId);
          const child = categoryCol.get(`subCategories.${childId}`);
          if (child) {
            targets.push(...child.children);
          }
        }

        for (const id of deleteChildrenIds) {
          categoryCol.del(`subCategories.${id}`);
        }
      }

      categoryCol.del(`subCategories.${id}`);

      return {
        status: 200,
        data: "ok",
      };
    },
  },
};
