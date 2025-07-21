import Joi from "joi"
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators"
import {GET_DB} from "~/config/mongodb"
import {ObjectId} from "mongodb"

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = "cards"
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  slug: Joi.string().required().min(3).trim().strict(),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
})
const INVALID_UPDATE_FIELDS = ['_id', 'boardId', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const newCardToAdd = { 
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
    }
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .insertOne(newCardToAdd)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const card = await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id)),
      })
    return card
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(key => {
      if (INVALID_UPDATE_FIELDS.includes(key)) {
        delete updatedData[key]
      }
    })

    if (updatedData.columnId) {
      updatedData.columnId = new ObjectId(String(updatedData.columnId))
    }
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .findOneAndUpdate({_id: new ObjectId(String(cardId))}, {$set: updatedData}, {returnDocument: "after"})
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    return await GET_DB()
      .collection(CARD_COLLECTION_NAME)
      .deleteMany({columnId: new ObjectId(String(columnId))})
  } catch (error) { 
    throw new Error(error)
  }
}

export const CardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  validateBeforeCreate,
  createNew,
  findOneById,    
  update, 
  deleteManyByColumnId,
}
