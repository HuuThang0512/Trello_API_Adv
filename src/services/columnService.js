import {slugify} from "~/utils/formatter"
import {ColumnModel} from "~/models/columnModel"
import {BoardModel} from "~/models/boardModel"
import {CardModel} from "~/models/cardModel"
import ApiError from "~/utils/ApiError"
import {cloneDeep} from "lodash"

const createNew = async (reqBody) => {
  try {
    const newColumn = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    const createdColumn = await ColumnModel.createNew(newColumn)
    const getNewColumn = await ColumnModel.findOneById(createdColumn.insertedId)
    if (getNewColumn) {
      // Xử lí cấu trúc data ở đây trước khi trả dữ liệu về
      getNewColumn.cards = []
      // Cập nhật mảng columnOrderIds của board
      await BoardModel.pushColumnOrderIds(getNewColumn)
     }
    return getNewColumn  
  } catch (error) {
    throw error
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: new Date(),
    }
    const updatedColumn = await ColumnModel.update(columnId, updatedData)
    return updatedColumn
  } catch (error) {
    throw error
  }
}

const deleteItem = async (columnId) => {

  try {
    const targetColumn = await ColumnModel.findOneById(columnId)
    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Column not found")
    }
    // Xoá column
    await ColumnModel.deleteOneById(columnId)
    // Xoá card
    await CardModel.deleteManyByColumnId(columnId)
    await BoardModel.pullColumnOrderIds(targetColumn)
    return {deleteResult: "Column and its cards have been deleted"}
  } catch (error) {
    throw error
  }
}

export const columnService = {
  createNew,
  update,
  deleteItem,
}
