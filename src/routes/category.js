
const Database = require("../datebase");
const Utility = require('../utility')

// const Symbols = {
//   type: Symbol("type"),
// }

module.exports = {
    "GET /category": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const { id } = req.query

            const categoryCol = Database.sharedInstance().getCollection("category")


            if (id === undefined) {
                return {
                    status: 200,
                    data: categoryCol.get('mainCategories')
                }
            }

            const subCategory = Object.values(categoryCol.get('subCategories') ?? {})
            console.log('subCategory', subCategory);
            return {
                status: 200,
                data: subCategory.filter(category => category.parent === id)
            }
        }
    },
    "POST /category": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const { parent, name } = req.body

            const categoryCol = Database.sharedInstance().getCollection("category")

            let parentIsSubCategory = false
            // let parentExists = !!categoryCol.get(`mainCategories.${parent}`)
            // 입력된 parent가 mainCategories에 포함되어 있으면 false
            let parentExists = !!categoryCol.get(`mainCategories.${parent}`)

            console.log(categoryCol.get(`mainCategories.${parent}`));
            console.log(!categoryCol.get(`mainCategories.${parent}`));
            console.log(!!categoryCol.get(`mainCategories.${parent}`));



            // console.log(!categoryCol.get(`mainCategories.${parent}`))
            // console.log(parentExists, parentExists);

            if (!parentExists) {
                // if (parentExists === undefined) {
                parentIsSubCategory = true
                parentExists = !!categoryCol.get(`subCategories.${parent}`)
                console.log('exist 2', parentExists);
                // console.log('test', categoryCol.get(`subCategories.${parent}`));

                const getValue = Object.values(categoryCol.get('subCategories'));
                const get = getValue.filter(subcategory => subcategory.parent === parent)
                console.log(get);

            }

            if (!parentExists) {
                const error = new Error("Parent id is Not exists")
                error.status = 403
                return error
            }

            const categoryModel = {
                id: Utility.UUID(true),
                parent,
                children: [],
                name,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }


            if (parentIsSubCategory) {
                const parentCategory = categoryCol.get(`subCategories.${parent}`)
                // console.log('parentCategory', parentCategory)
                parentCategory.children.push(categoryModel.id)
                categoryCol.set(`subCategories.${parent}`, parentCategory)
            }

            categoryCol.set(`subCategories.${categoryModel.id}`, categoryModel)

            return {
                status: 200,
                data: "ok"
            }
        },
    },
    "PATCH /category": {
        middlewares: ["auth"],
        async handler(req, rep) {

        }
    },
    "DELETE /category": {
        middlewares: ["auth"],
        async handler(req, rep) {
            const { id } = req.body

            const categoryCol = Database.sharedInstance().getCollection("category")

            const category = categoryCol.get(`subCategories.${id}`)
            if (category === undefined) {
                const error = new Error("Category is Not exists")
                error.status = 403
                return error
            }

            if (category.parent) {
                const parentCategory = categoryCol.get(`subCategories.${category.parent}`)
                if (parentCategory) {
                    const idx = parentCategory.children.indexOf(id)
                    if (idx === -1) {
                        parentCategory.children.splice(idx, 1)
                        categoryCol.set(`subCategories.${category.parent}`, parentCategory)
                    }
                }
            }

            if (category.children.length > 0) {
                const deleteChildrenIds = []
                const targets = [...category.children]
                while (targets.length > 0) {
                    const childId = targets.pop()
                    deleteChildrenIds.push(childId)
                    const child = categoryCol.get(`subCategories.${childId}`)
                    if (child) {
                        targets.push(...child.children)
                    }
                }

                for (const id of deleteChildrenIds) {
                    categoryCol.del(`subCategories.${id}`)
                }
            }

            categoryCol.del(`subCategories.${id}`)

            return {
                status: 200,
                data: "ok"
            }
        }
    },

    // TODO : subcategory를 삭제하는 기능 추가
    // 
};
