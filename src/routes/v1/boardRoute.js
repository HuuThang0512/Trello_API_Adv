import express from "express";
import { StatusCodes } from "http-status-codes";
import { boardValidation } from "~/validations/boardValidation.js";
import { boardController } from "~/controllers/boardController.js";
import { authMiddleware } from "~/middlewares/authMiddleware.js";

const Router = express.Router();
// const { createNew } = boardValidation
Router.route("/")
  .get(authMiddleware.isAuthoried, (req, res) => {
    res.status(StatusCodes.OK).json({ message: "GET" });
  })
  .post(
    authMiddleware.isAuthoried,
    boardValidation.createNew,
    boardController.createNew
  );

Router.route("/:id")
  .get(authMiddleware.isAuthoried, boardController.getDetails)
  .put(
    authMiddleware.isAuthoried,
    boardValidation.update,
    boardController.update
  )
  .delete();

// API hỗ trợ di chuyển card giữa các column khác nhau
Router.route("/support/move-card").put(
  authMiddleware.isAuthoried,
  boardValidation.moveCardToDifferentColumns,
  boardController.moveCardToDifferentColumns
);

export const boardRoute = Router;
