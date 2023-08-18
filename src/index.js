const Fs = require("fs");
const Database = require("./datebase");
const Utility = require("../src/utility");
const DevMongoDB = require("./mongodb");

const CSVToJSON = require("csvtojson");
const Path = require("path");
const Config = require("./config.json");

const Fastify = require("fastify");
const Cors = require("@fastify/cors");
const MongoDB = require("./mongodb");

class WebServer {
  constructor(opts = {}) {
    this.$opts = opts;
    this.$webServer = Fastify();
    this.$middlewares = {};

    // this.$_initCSVToJSON();
    this.$_initDatabase();
    this.$_initMiddlewares();
    this.$_initMongoDB();
    this.$_initRoutes();
  }

  // TODO : DEV CODE, mongoDB test
  async $_initMongoDB() {
    const dbName = "test_db";
    const mongoDB = await MongoDB.sharedInstance();

    await mongoDB.connect({
      host: "172.16.0.6",
      port: 27017,
      db: dbName,
    });

    const mainCategories = await mongoDB.getCollection("mainCategory");
    const subCategories = await mongoDB.getCollection("subCategory");
    const counterCol = await mongoDB.getCollection("counter");

    if (
      (await mainCategories.count()) === 0 ||
      (await subCategories.count()) === 0 ||
      (await counterCol.count()) === 0
    ) {
      for (const [mainKey, mainValue] of Object.entries(
        Config.mainCategories
      )) {
        for (const subValue of Config.subCategories) {
          const categoryModel = {
            id: Utility.UUID(true),
            parent: mainKey,
            children: [],
            name: subValue,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          await subCategories.insertOne(categoryModel);
        }
        counterCol.insertOne({ key: mainKey, counter: 0 });
        mainCategories.insertOne({
          key: mainKey,
          value: mainValue,
        });
      }

      // await mainCategories.insertOne(Config.mainCategories);
    }
  }

  // TODO : 서버 실행 시 mainCategory의 초기값을 생성
  $_initDatabase() {
    // Category Initialize
    const counterCol = Database.sharedInstance().getCollection("counter");
    const categoryCol = Database.sharedInstance().getCollection("category");

    // console.log('counterCol.get()', counterCol.get('ko'));

    // counterCol이 없으면 생성하고 모든 카테고리를 생성하고 0을 set
    if (counterCol.get("ko") === undefined) {
      Object.keys(Config.mainCategories).forEach((item) => {
        counterCol.set(item, 0);
      });
    }

    categoryCol.set("mainCategories", Config.mainCategories);

    // TODO : subCategories가 없으면 생성
    // mainCategories에 Config.subCategories를 추가하는 기능
    if (categoryCol.get("subCategories") === undefined) {
      for (const [mainKey, value] of Object.entries(Config.mainCategories)) {
        console.log("key", mainKey);

        for (const subValue of Config.subCategories) {
          const categoryModel = {
            id: Utility.UUID(true),
            parent: mainKey,
            children: [],
            name: subValue,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          categoryCol.set(`subCategories.${categoryModel.id}`, categoryModel);
        }
      }
    }
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
    // TODO : cors header setting
    this.$webServer.register(Cors, { origin: "*" });

    this.$webServer.listen({
      host: this.$opts.host,
      port: this.$opts.port,
    });

    console.log(`[${new Date().toLocaleString()}] Server Started.`);
  }
}

module.exports = WebServer;

// TODO : test, csv to json
// async $_initCSVToJSON() {
// const csvData = await CSVToJSON()
//   .fromFile("src/assets/test_csv.csv")
//   .then((data) => {
//     return data;
//   });

// const categoryCol = Database.sharedInstance().getCollection("category");
// const questionCol = Database.sharedInstance().getCollection("question");
// const subCategories = Object.values(categoryCol.get("subCategories"));

// console.log("subCategories", subCategories);
// console.log("questionCol", questionCol);

// for (const data of csvData) {
//   console.log("data", data.subCategory);
//   console.log(subCategories.find((item) => item.name == data.subCategory));

//   const getSub = subCategories.find(
//     (item) => item.name == data.subCategory
//   );

//   const newID = Utility.UUID(true);

//   questionCol.set(newID, {
//     id: newID,
//     question: data.question,
//     answer: data.answer,
//     updatedAt: Date.now(),
//     createdAt: Date.now(),
//     categoryID: getSub.id,
//     difficulty: "normal",
//     scroe: 3,
//     period: [],
//   });
// }

// console.log(subCategories.find((item) => item.name == title));
// }
