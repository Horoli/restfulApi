
module.exports = {
    'POST /hello': {
        async handler(req, rep) {
            return {
                "data": "ok"
            }
        }
    },
    'GET /hello': {
        async handler(req, rep) {
            return {
                "data": "ok"
            }
        }
    }
}