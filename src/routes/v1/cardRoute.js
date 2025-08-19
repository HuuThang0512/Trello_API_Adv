import express from "express"
import {cardValidation} from "~/validations/cardValidation.js"
import {cardController} from "~/controllers/cardController.js"
import { authMiddleware } from "~/middlewares/authMiddleware.js";


const Router = express.Router()
Router.route("/").post(authMiddleware.isAuthoried, cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
