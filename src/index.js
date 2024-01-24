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
    // this.$_initDatabase();
    this.$_initMiddlewares();
    this.$_initMongoDB();
    this.$_initRoutes();
  }

  // TODO : DEV CODE, mongoDB test
  async $_initMongoDB() {
    const dbName = "imyong";
    const mongoDB = await MongoDB.sharedInstance();

    await mongoDB.connect({
      host: "172.16.0.7",
      port: 27017,
      db: dbName,
    });

    console.log('aaaaaaaaa')

    const mainCategories = await mongoDB.innerGetCollection("mainCategory");
    const subCategories = await mongoDB.innerGetCollection("subCategory");
    const counterCol = await mongoDB.innerGetCollection("counter");

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
    }
  }

  // TODO : 서버 실행 시 mainCategory의 초기값을 생성
  // $_initDatabase() {
  //   // Category Initialize
  //   const counterCol = Database.sharedInstance().getCollection("counter");
  //   const categoryCol = Database.sharedInstance().getCollection("category");

  //   // console.log('counterCol.get()', counterCol.get('ko'));

  //   // counterCol이 없으면 생성하고 모든 카테고리를 생성하고 0을 set
  //   if (counterCol.get("ko") === undefined) {
  //     Object.keys(Config.mainCategories).forEach((item) => {
  //       counterCol.set(item, 0);
  //     });
  //   }

  //   categoryCol.set("mainCategories", Config.mainCategories);

  //   // TODO : subCategories가 없으면 생성
  //   // mainCategories에 Config.subCategories를 추가하는 기능
  //   if (categoryCol.get("subCategories") === undefined) {
  //     for (const [mainKey, value] of Object.entries(Config.mainCategories)) {
  //       console.log("key", mainKey);

  //       for (const subValue of Config.subCategories) {
  //         const categoryModel = {
  //           id: Utility.UUID(true),
  //           parent: mainKey,
  //           children: [],
  //           name: subValue,
  //           createdAt: Date.now(),
  //           updatedAt: Date.now(),
  //         };

  //         categoryCol.set(`subCategories.${categoryModel.id}`, categoryModel);
  //       }
  //     }
  //   }
  // }

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

    // for (const filename of routeFiles) {
    //   const filePath = Path.join(routesPath, filename);
    //   const isDirectory = Fs.lstatSync(filePath).isDirectory();

    //   console.log(filePath)

    //   if (isDirectory) {
    //     const subRouteFiles = Fs.readdirSync(filePath);

    //     for (const subFilename of subRouteFiles) {
    //         const routePath = Path.join(filePath, subFilename);
    //         const routes = require(routePath);

    //       for (const routeEndpoint of Object.keys(routes)) {
    //         const routeDef = routes[routeEndpoint];
    //         const [method, path] = routeEndpoint.split(" ");

    //         const options = {
    //           preHandler: async (req, rep, done) => {
    //             const middlewares = routeDef.middlewares ?? [];

    //             for (const middlewareName of middlewares) {
    //               if (middlewareName in this.$middlewares) {
    //                 const middleware = this.$middlewares[middlewareName];
    //                 if (middleware) {
    //                   const middlewareResult = await middleware(req, rep);
    //                   if (middlewareResult instanceof Error) {
    //                     return done(middlewareResult);
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }

    //         const version = filePath.substring(filePath.length - 2, filePath.length);
    //         const fileRoutePath = subFilename.slice(0, -3);
    //         const endpoint = `/${version}/${fileRoutePath}${path}`;
    //         console.log('endpoint', endpoint)



    //         this.$webServer[method.toLowerCase()](endpoint, options, routeDef.handler);
    //       }
    //     }
    //   }
    // }

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
            // done();
          },
        };

        // TODO : preHandler가 포함된 options 추가
        this.$webServer[method.toLowerCase()](path, options, routeDef.handler);
      }
    }
  }



  /**
  * 입력받은 filePath의 파일들을 가져와서 파일인지 directory인지 확인 후
  * directory이면 directory내부로 접근하여 파일을 가져오고,
  * 파일이면 endpoint를 가져오는 재귀함수
  */

  // $_initRoutes() {
  //   const routesPath = Path.join(__dirname, "./routes");
  //   this._loadRoutes(routesPath);
  // }

  // _loadRoutes(filePath) {

  //   // 해당 path의 파일이 directory인지 확인
  //   const isDirectory = Fs.lstatSync(filePath).isDirectory();

  //   if (isDirectory) {
  //     // directory이면 해당 directory의 파일들을 가져옴
  //     const subFiles = Fs.readdirSync(filePath);

  //     for (const filename of subFiles) {

  //       const subFilePath = Path.join(filePath, filename);

  //       // 함수 본인을 재실행함
  //       this._loadRoutes(subFilePath);
  //     }
  //   } else {
  //     // 폴더가 아니면 endpoint를 가져오는 로직
  //     const routes = require(filePath);
  //     for (const routeEndpoint of Object.keys(routes)) {
  //       const routeDef = routes[routeEndpoint];
  //       const [method, path] = routeEndpoint.split(" ");

  //       const options = {
  //         preHandler: async (req, rep, done) => {
  //           const middlewares = routeDef.middlewares ?? [];

  //           for (const middlewareName of middlewares) {
  //             if (middlewareName in this.$middlewares) {
  //               const middleware = this.$middlewares[middlewareName];
  //               if (middleware) {
  //                 const middlewareResult = await middleware(req, rep);
  //                 if (middlewareResult instanceof Error) {
  //                   return done(middlewareResult);
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       }

  //       const routesIndex = filePath.indexOf('routes\\');
  //       const getPath = filePath.substring(routesIndex + 7);

  //       const versionCheck = getPath.indexOf('\\');

  //       if (versionCheck === -1) {
  //         const fileRoutePath = getPath.slice(0, -3);
  //         const endpoint = `/${fileRoutePath}${path}`;
  //         this.$webServer[method.toLowerCase()](endpoint, options, routeDef.handler);
  //       }

  //       if (versionCheck !== -1) {
  //         const fileRoutePath = getPath.slice(0, -3);

  //         const splitFileRoutePath = fileRoutePath.split('\\');

  //         const endpoint = '/' + splitFileRoutePath.join('/');

  //         this.$webServer[method.toLowerCase()](endpoint, options, routeDef.handler);
  //       }
  //     }
  //   }
  // }


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
