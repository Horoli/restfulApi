
const Crypto = require('crypto')

const Database = require('./datebase')

class Utility {
    static UUID(dashless = false) {
        let uuid = Crypto.randomUUID()
        if (dashless)
            uuid = uuid.replace(/-/g, '')
        return uuid
    }


    // base64String을 받아서 'src/assets/images'에 '${uuid}.base64로 저장하고, 해당 파일의 경로를 리턴
    static saveImage(base64String) {
        const uuid = Utility.UUID(true);
        const imagePath = `src/assets/images/${uuid}.base64`

        const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, "")

        require('fs').writeFile(imagePath, base64Data, 'base64', function (err) {
            console.log('saveImage err', err);
        });

        return uuid;
    }

    // uuid을 입력 받아서 'src/assets/images'에 저장된 파일 중 해당 uuid를 가진 파일의 내용을 읽어서 base64로 변환 후 리턴

    static getImage(uuid) {
        const imagePath = `src/assets/images/${uuid}.base64`

        const base64String = require('fs').readFileSync(imagePath, 'base64')

        return base64String;
    }

    s


    static deleteImage(uuid) {
        const imagePath = `src/assets/images/${uuid}.base64`
        require('fs').unlink(imagePath, (err) => {
            console.log('deleteImage err', err);
        })
    }

    static graphLookup(json, id, key) {
        const firstDock = json[id]
        if (!firstDock)
            return undefined
        if (!firstDock[key])
            return firstDock

        const stack = [firstDock]
        while (stack[0][key] !== undefined) {
            const parentDoc = json[stack[0][key]]
            if (!parentDoc)
                break

            stack.unshift(parentDoc)
        }
        return stack
    }

    static getRootCategoryFromChildCategory(id) {
        const subCategories = Database.sharedInstance().getCollection('category').get('subCategories')
        const categories = Utility.graphLookup(subCategories, id, 'parent')
        return categories[0].parent
    }
    static getCounter(id) {
        const counterCol = Database.sharedInstance().getCollection('counter')
        if (counterCol.get(id) === undefined)
            counterCol.set(id, 0)

        return counterCol.get(id)
    }
    static addCounter(id, value) {
        const counterCol = Database.sharedInstance().getCollection('counter')
        console.log('addCounter', counterCol);
        if (counterCol.get(id) === undefined)
            counterCol.set(id, 0)

        counterCol.set(id, counterCol.get(id) + value)
    }
}

module.exports = Utility