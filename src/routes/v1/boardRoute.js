import express from "express"
import { StatusCodes } from "http-status-codes"
import { boardValidation } from "~/validations/boardValidation.js"
import { boardController } from "~/controllers/boardController.js"

const Router = express.Router()
// const { createNew } = boardValidation
Router.route("/")
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: "GET" })
  })
  .post(boardValidation.createNew, boardController.createNew)

Router.route("/:id")
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)
  .delete();

// API hỗ trợ di chuyển card giữa các column khác nhau
Router.route("/support/move-card")
  .put(boardValidation.moveCardToDifferentColumns, boardController.moveCardToDifferentColumns)

export const boardRoute = Router
