import {slugify} from "~/utils/formatter"
import {BoardModel} from "~/models/boardModel"
import {ColumnModel} from "~/models/columnModel"
import {CardModel} from "~/models/cardModel"
import {StatusCodes} from "http-status-codes"
import ApiError from "~/utils/ApiError"
import {cloneDeep} from "lodash"

const createNew = async (reqBody) => {
  try {
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    const createdBoard = await BoardModel.createNew(newBoard)
    const getNewBoard = await BoardModel.getDetails(createdBoard.insertedId)
    return getNewBoard
  } catch (error) {
    throw error
  }
}
const getDetails = async (boardId) => {
  try {
    const board = await BoardModel.getDetails(boardId)

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Board not found")
    }
    const resBoard = cloneDeep(board)
    resBoard.columns.forEach((column) => {
      column.cards = resBoard.cards.filter((card) =>
        card.columnId.equals(column._id),
      )
    })
    delete resBoard.cards
    return resBoard
  } catch (error) {
    throw error
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updatedData = {
      ...reqBody,
      updatedAt: Date.now(),
    }
    const updatedBoard = await BoardModel.update(boardId, updatedData)
    return updatedBoard
  } catch (error) {
    throw error
  }
}

// API hỗ trợ di chuyển card giữa các column khác nhau
const moveCardToDifferentColumns = async (reqBody) => {
  try {
    // Update cardOrderIds của column chứa card trước khi kéo
    await ColumnModel.update(reqBody.prevColId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now(),
    })
    // Update cardOrderIds của column chứa card sau khi kéo
    await ColumnModel.update(reqBody.nextColId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now(),
    })
    // Update columnId của Card
    await CardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColId,
      updatedAt: Date.now(),
    })
    // Update board
    return {updateResult: 'Success'}
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumns,
}
