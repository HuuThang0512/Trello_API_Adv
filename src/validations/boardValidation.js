import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import { BOARD_TYPE } from "~/utils/constants";
import { OBJECT_ID_RULE_MESSAGE, OBJECT_ID_RULE } from "~/utils/validators";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      "any.required": "Title is required",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must be less than 50 characters long",
      "string.trim": "Title must not contain leading or trailing whitespace",
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().required().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE),
  });
  try {
    console.log(req.body);
    // Ser abortEarly: false để trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // res.status(StatusCodes.CREATED).json({ message: "POST" })
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict().messages({
      "any.required": "Title is required",
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title must be less than 50 characters long",
      "string.trim": "Title must not contain leading or trailing whitespace",
    }),
  });
  try {
    // Ser abortEarly: false để trả về tất cả lỗi
    // allowUnknown: true để cho phép các field không được định nghĩa trong schema vẫn được validate
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

const moveCardToDifferentColumns = async (req, res, next) => {
  console.log(req.body);
  const correctCondition = Joi.object({
    currentCardId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevColId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      )
      .required(),
    nextColId: Joi.string()
      .required()
      .pattern(OBJECT_ID_RULE)
      .message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array()
      .required()
      .items(
        Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
      ),
  });
  try {
    // Ser abortEarly: false để trả về tất cả lỗi
    // allowUnknown: true để cho phép các field không được định nghĩa trong schema vẫn được validate
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    next(
      new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message)
    );
  }
};

export const boardValidation = {
  createNew,
  update,
  moveCardToDifferentColumns,
};
