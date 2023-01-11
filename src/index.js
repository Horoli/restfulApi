const Fs = require('fs');
const Path = require('path');

const Fastify = require('fastify');

class WebServer{
    constructor(opts ={}){
        this.$opts = opts;
        this.$webServer = Fastify();
        this.$_initRoutes();
    }

    $_initRoutes(){
        const routesPath = Path.join(__dirname, './routes');
        const routeFiles = Fs.readdirSync(routesPath);
        
        for(const filename of routeFiles){
            const routePath = Path.join(routesPath, filename);
            const routes = require(routePath);

            for(const routeEndpoint of Object.keys(routes)){
                const routeDef = routes[routeEndpoint];

                const [method, path] = routeEndpoint.split(' ');
                this.$webServer[method.toLowerCase()](path, routeDef.handler);
            }
        }
    }

    start(){
        this.$webServer.listen({
            host:this.$opts.host,
            port: this.$opts.port,
        });

        console.log(`[${(new Date).toLocaleString()}] Server Started.`);

    }
}

module.exports = WebServer;