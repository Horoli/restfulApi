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
            return json
        }
    }
}



    // "quest": [
    //     {
    //         "kind": "",
    //         "description": "1 + 1 = ?",
    //         "choise": [
    //             "1",
    //             "2",
    //             "3",
    //             "4"
    //         ],
    //         "correct": "2"
    //     },
    //     {
    //         "kind": "",
    //         "description": "1 + 2 = ?",
    //         "choise": [
    //             "1",
    //             "2",
    //             "3",
    //             "4"
    //         ],
    //         "correct": "3"
    //     }
    // ]