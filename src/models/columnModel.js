import Joi from "joi";
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from "~/utils/validators";
import { GET_DB } from "~/config/mongodb";
import { ObjectId } from "mongodb";

// Define Collection (name & schema)
const COLUMN_COLLECTION_NAME = "columns";
const COLUMN_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string()
    .required()
    .pattern(OBJECT_ID_RULE)
    .message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  cardOrderIds: Joi.array()
    .items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE))
    .default([]),

  createdAt: Joi.date().timestamp("javascript").default(Date.now),
  updatedAt: Joi.date().timestamp("javascript").default(null),
  _destroy: Joi.boolean().default(false),
});

const INSERT_DEFAULT_VALUE = ["_id", "boardId", "createdAt"];

const validateBeforeCreate = async (data) => {
  return await COLUMN_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
};

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newColumnToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
    };
    return await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .insertOne(newColumnToAdd);
  } catch (error) {
    throw new Error(error);
  }
};

const findOneById = async (id) => {
  try {
    const column = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(String(id)),
      });
    return column;
  } catch (error) {
    throw new Error(error);
  }
};

/**
 *
 * Hàm này để update mảng cardOrderIds của column khi thêm card mới
 * @param {*} column
 * @param {*} boardId
 * @returns
 */
const pushCardOrderIds = async function (card) {
  try {
    const column = await findOneById(card.boardId);
    if (column) {
      const result = await GET_DB()
        .collection(COLUMN_COLLECTION_NAME)
        .findOneAndUpdate(
          { _id: new ObjectId(String(column._id)) },
          { $push: { cardOrderIds: new ObjectId(String(card._id)) } },
          { returnDocument: "after" }
        );
      return result.value;
    }
    return null;
  } catch (error) {
    throw new Error(error);
  }
};

const update = async (columnId, data) => {
  try {
    Object.keys(data).forEach((key) => {
      if (INSERT_DEFAULT_VALUE.includes(key)) {
        delete data[key];
      }
    });
    if (data.cardOrderIds) {
      data.cardOrderIds = data.cardOrderIds.map((id) => new ObjectId(String(id)));
    }
    const result = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(String(columnId)) },
        { $set: data },
        { returnDocument: "after" }
      );
    return result.value;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteOneById = async (columnId) => {

  try {
    const deletedColumn = await GET_DB()
      .collection(COLUMN_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(String(columnId)) });
    return deletedColumn;
  } catch (error) {
    throw new Error(error);
  }
};

export const ColumnModel = {
  COLUMN_COLLECTION_NAME,
  COLUMN_COLLECTION_SCHEMA,
  validateBeforeCreate,
  createNew,
  findOneById,
  pushCardOrderIds,
  update,
  deleteOneById,
};
