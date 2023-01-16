const WebServer = require('./src');

const server = new WebServer({
    host: '0.0.0.0',
    port: 3000, 
})

server.start()
