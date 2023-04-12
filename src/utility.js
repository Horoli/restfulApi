
const Crypto = require('crypto')

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


    static deleteImage(uuid) {
        const imagePath = `src/assets/images/${uuid}.base64`
        require('fs').unlink(imagePath, (err) => {
            console.log('deleteImage err', err);
        })
    }
}

module.exports = Utility