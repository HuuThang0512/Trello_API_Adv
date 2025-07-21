import {slugify} from "~/utils/formatter"
import {CardModel} from "~/models/cardModel"
import {ColumnModel} from "~/models/columnModel"
import ApiError from "~/utils/ApiError"
import {cloneDeep} from "lodash"

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody,
      slug: slugify(reqBody.title),
    }
    const createdCard = await CardModel.createNew(newCard)
    const getNewCard = await CardModel.findOneById(createdCard.insertedId)
    if (getNewCard) {
      await ColumnModel.pushCardOrderIds(getNewCard)
    }
    return getNewCard
  } catch (error) {
    throw error
  }
}

export const cardService = {
  createNew,
}
