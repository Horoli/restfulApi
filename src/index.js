const Fs = require("fs");
const Path = require("path");

const Fastify = require("fastify");

const Database = require('./datebase')

const Config = require('./config.json')

class WebServer {
  constructor(opts = {}) {
    this.$opts = opts;
    this.$webServer = Fastify();
    this.$middlewares = {};

    this.$_initDatabases();
    this.$_initMiddlewares();
    this.$_initRoutes();
  }

  $_initDatabases() {
    // Category Initialize
    const categoryCol = Database.sharedInstance().getCollection("category")
    categoryCol.set('mainCategories', Config.mainCategories)
  }

  $_initMiddlewares() {
    const middlewaresPath = Path.join(__dirname, "./middlewares");
    const middlewaresFiles = Fs.readdirSync(middlewaresPath);

    for (const filename of middlewaresFiles) {
      const middlewarePath = Path.join(middlewaresPath, filename);
      const middleware = require(middlewarePath);
      this.$middlewares[filename.slice(0, -3)] = middleware;
    }
  }

  $_initRoutes() {
    const routesPath = Path.join(__dirname, "./routes");
    const routeFiles = Fs.readdirSync(routesPath);

    for (const filename of routeFiles) {
      const routePath = Path.join(routesPath, filename);
      const routes = require(routePath);

      for (const routeEndpoint of Object.keys(routes)) {
        const routeDef = routes[routeEndpoint];
        const [method, path] = routeEndpoint.split(" ");

        // TODO : preHandler 추가
        const options = {
          preHandler: async (req, rep, done) => {
            const middlewares = routeDef.middlewares ?? [];

            for (const middlewareName of middlewares) {
              if (middlewareName in this.$middlewares) {
                const middleware = this.$middlewares[middlewareName];

                const middlewareResult = await middleware(req, rep);
                if (middlewareResult instanceof Error) {
                  return done(middlewareResult);
                }
              }
            }
            //
            done();
          },
        };

        // TODO : preHandler가 포함된 options 추가
        this.$webServer[method.toLowerCase()](path, options, routeDef.handler);
      }
    }
  }

  start() {
    this.$webServer.listen({
      host: this.$opts.host,
      port: this.$opts.port,
    });


    console.log(`[${new Date().toLocaleString()}] Server Started.`);
  }
}

module.exports = WebServer;
