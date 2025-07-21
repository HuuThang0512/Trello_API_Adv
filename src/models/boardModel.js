import Joi from "joi"
import {OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE} from "~/utils/validators"
import {GET_DB} from "~/config/mongodb"
import {ObjectId} from "mongodb"
import {BOARD_TYPE} from "~/utils/constants"
import {ColumnModel} from "./columnModel"
import {CardModel} from "./cardModel"
import {isEmpty} from "lodash"

const BOARD_COLLECTION_NAME = "boards"
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(255).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(255).trim().strict(),
  type: Joi.string().required().valid(BOARD_TYPE.PUBLIC, BOARD_TYPE.PRIVATE),
  columnOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),
  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
})

const INVALID_UPDATE_FIELDS = ["_id", "createdAt"]

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const board = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id)),
      })
    return board
  } catch (error) {
    throw new Error(error)
  }
}
const getDetails = async (id) => {
  try {
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(String(id)),
            _destroy: false,
          },
        },
        {
          $lookup: {
            from: ColumnModel.COLUMN_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "columns",
          },
        },
        {
          $lookup: {
            from: CardModel.CARD_COLLECTION_NAME,
            localField: "_id",
            foreignField: "boardId",
            as: "cards",
          },
        },
      ])
      .toArray()
    return result[0] || null
  } catch (error) {
    throw new Error(error)
  }
}
const pushColumnOrderIds = async function (column) {
  try {
    const board = await findOneById(column.boardId)
    if (board) {
      const result = await GET_DB()
        .collection(BOARD_COLLECTION_NAME)
        .findOneAndUpdate(
          {_id: new ObjectId(String(board._id))},
          {$push: {columnOrderIds: new ObjectId(String(column._id))}},
          {returnDocument: "after"},
        )
      return result
    }
    return null
  } catch (error) {
    throw new Error(error)
  }
}

const pullColumnOrderIds = async function (column) {
  try {
    const board = await findOneById(column.boardId)
    if (board) {
      const result = await GET_DB()
        .collection(BOARD_COLLECTION_NAME)
        .findOneAndUpdate(
          {_id: new ObjectId(String(board._id))},
          {$pull: {columnOrderIds: new ObjectId(String(column._id))}},
          {returnDocument: "after"},
        )
      return result
    }
    return null
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updatedData) => {
  try {
    // Xóa các field không được phép update
    Object.keys(updatedData).forEach((fieldName) => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updatedData[fieldName]
      }
    })
    if (isEmpty(updatedData)) {
      return null
    }
    if (updatedData.columnOrderIds) {
      updatedData.columnOrderIds = updatedData.columnOrderIds.map((id) => new ObjectId(String(id)))
    }
    const result = await GET_DB()
      .collection(BOARD_COLLECTION_NAME)
      .findOneAndUpdate({_id: new ObjectId(String(boardId))}, {$set: updatedData}, {returnDocument: "after"})
    return result
  } catch (error) {
    throw new Error(error)
  }
}

// API hỗ trợ di chuyển card giữa các column khác nhau
const moveCardToDifferentColumns = async (reqBody) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate({_id: new ObjectId(String(reqBody.boardId))}, {$set: {columnOrderIds: reqBody.columnOrderIds}}, {returnDocument: "after"})
    return result
  } catch (error) {
    throw new Error(error)
  }
}

export const BoardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
  moveCardToDifferentColumns,
};
