import express from "express"
import cors from "cors"
import { corsOptions } from "./config/cors.js"
import exitHook from "async-exit-hook"
import { CONNECT_DB, GET_DB, CLOSE_DB } from "./config/mongodb.js"
import { env } from "~/config/environment"
import { APIs_V1 } from "~/routes/v1"
import { errorHandlingMiddleware } from "~/middlewares/errorHandlingMiddleware.js"
const START_SERVER = () => {
  const app = express()
  app.use(cors(corsOptions))

  // Xử lí CORS
  app.use(express.json())

  app.use("/v1", APIs_V1)
  // app.get("/", async (req, res) => {
  //   // Test Absolute import mapOrder
  //   console.log(await GET_DB().listCollections().toArray())
  //   res.end("<h1>Hello World!</h1><hr>")
  // })

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)
  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Hello ${env.AUTHOR}, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`,
    )
  })

  /**Thực hiện các tác vụ cleanup trước khi đóng server */
  exitHook(() => {
    console.log("Disconnecting")
    CLOSE_DB()
    console.log("Disconnected")
  })
}

;(async () => {
  try {
    console.log("Connecting")
    await CONNECT_DB()
    START_SERVER()
  } catch (err) {
    console.log("Error connecting to MongoDB", err)
    process.exit(0)
  }
})()
