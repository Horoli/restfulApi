const Fs = require("fs");
const Path = require("path");

const Fastify = require("fastify");

const Database = require("./datebase");

const Config = require("./config.json");
const CSVToJSON = require("csvtojson");

class WebServer {
  constructor(opts = {}) {
    this.$opts = opts;
    this.$webServer = Fastify();
    this.$middlewares = {};

    this.$_initCSVToJSON();
    this.$_initDatabase();
    this.$_initMiddlewares();
    this.$_initRoutes();
  }

  // TODO : test, csv to json
  $_initCSVToJSON() {
    CSVToJSON()
      .fromFile("src/assets/test_csv.csv")
      .then((data) => {
        console.log(data);
        console.log(data[0]);
      });

    const categoryCol = Database.sharedInstance().getCollection("category");
    const subCategories = Object.values(categoryCol.get("subCategories"));
    const title = "교과교육론";

    console.log(subCategories.find((item) => item.name == title));
  }

  // TODO : 서버 실행 시 mainCategory의 초기값을 생성
  $_initDatabase() {
    // Category Initialize
    const categoryCol = Database.sharedInstance().getCollection("category");
    const difficultyCol = Database.sharedInstance().getCollection("difficulty");
    categoryCol.set("mainCategories", Config.mainCategories);
    difficultyCol.set("difficulty", Config.difficulty);
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
