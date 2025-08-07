import { userModel } from '~/models/userModel'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatter'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã tồn tại')
    }
    // Tạo data để lưu vào db
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      username: nameFromEmail,
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp, càng cao thì băm càng lâu
      displayName: nameFromEmail, // Mặc định cho là emailname sau khi dăng kí
      verifyToken: uuidv4()
    }

    // Lưu vào DB
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)

    // Gửi email cho người dùng xác thực
    const verificationEmail = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = "Verify your email"
    const customHtml = `
      <h2>Verify your email</h2>
      <p>Welcome to our website</p>
      <a href="${verificationEmail}">Click here to verify your email</a>
    `
    // Gọi tới provider để gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, customHtml);

    // Trả về dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    throw error
  }
}

export const userService = {
  createNew
}