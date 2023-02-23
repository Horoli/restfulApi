
const Crypto = require('crypto')

class Utility {
    static UUID(dashless = false) {
        let uuid = Crypto.randomUUID()
        if (dashless)
            uuid = uuid.replace(/-/g, '')
        return uuid
    }
}

module.exports = Utility