// https://github.com/fastify/fastify


const fastify = require('fastify');
const fs = require('fs');

const server = fastify({
    logger: true
});


const json = JSON.parse(fs.readFileSync('./db.json'));

// const json = {
//     "quest": [
//         {
//             "kind": "",
//             "description": "1 + 1 = ?",
//             "choise": [
//                 "1",
//                 "2",
//                 "3",
//                 "4"
//             ],
//             "correct": "2"
//         }
//     ]
// }

server.get('/', async (req, res) => {
    return json;
});

server.post('/:paramVal', async (req, res) => {
    json.quest.push(
        {
            "kind": "",
            "description": "1 + 2 = ?",
            "choise": [
                "1",
                "2",
                "3",
                "4"
            ],
            "correct": "2"
        }
    );

    fs.writeFileSync('./db.json', JSON.stringify(json))

    return json;
    // return {
    // params: req.params,
    // body: req.body,
    // query: req.query,
    // header: req.header,
    // }
})

server.patch('/', async (req, res) => {
    return { hello: 'world' }
});

server.put('/', async (req, res) => {
    return { hello: 'world' }
});

server.delete('/', async (req, res) => {
    return { hello: 'world' }
});

server.all('/allRoute', async (req, res) => {
    return { all: 'route' }
});



// function user(server, opts, done) {

//     server.get('/', async (req, res) => {
//         return { hello: 'aaaa' }
//     });


//     server.post('/:id', async (req, res) => {
//         return { hello: 'shit' }
//     });

//     server.patch('/:id', async (req, res) => {
//         return { hello: 'fuck' }
//     });

//     server.delete('/:id', async (req, res) => {
//         return { hello: 'dddd' }
//     });

//     done();
// }

// server.register(user, { prefix: '/user' });

// server.listen(3000);
server.listen({ port: 3000 });