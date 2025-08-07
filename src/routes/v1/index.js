import express from "express"
import { StatusCodes } from "http-status-codes"
import { boardRoute } from "./boardRoute.js"
import { columnRoute } from "./columnRoute.js"
import { cardRoute } from "./cardRoute.js"
import { userRoute } from "./userRoute.js"

const Router = express.Router()

Router.get("/status", (req, res) => { })
/**Board API */
Router.use("/boards", boardRoute)
/**Column API */
Router.use("/columns", columnRoute)
/**Card API */
Router.use("/cards", cardRoute)
/**User API */
Router.use("/users", userRoute)

export const APIs_V1 = Router
