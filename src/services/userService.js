import { userModel } from "~/models/userModel";
import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { pickUser } from "~/utils/formatter";
import { WEBSITE_DOMAIN } from "~/utils/constants";
import { BrevoProvider } from "~/providers/BrevoProvider";
import { JwtProvider } from "~/providers/JwtProvider";
import { env } from "~/config/environment";

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, "Email đã tồn tại");
    }
    // Tạo data để lưu vào db
    const nameFromEmail = reqBody.email.split("@")[0];
    const newUser = {
      username: nameFromEmail,
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp, càng cao thì băm càng lâu
      displayName: nameFromEmail, // Mặc định cho là emailname sau khi dăng kí
      verifyToken: uuidv4(),
    };

    // Lưu vào DB
    const createdUser = await userModel.createNew(newUser);
    const getNewUser = await userModel.findOneById(createdUser.insertedId);

    // Gửi email cho người dùng xác thực
    const verificationEmail = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`;
    const customSubject = "Verify your email";
    const customHtml = `
      <h2>Verify your email</h2>
      <p>Welcome to our website</p>
      <a href="${verificationEmail}">Click here to verify your email</a>
    `;
    // Gọi tới provider để gửi email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, customHtml);

    // Trả về dữ liệu cho controller
    return pickUser(getNewUser);
  } catch (error) {
    throw error;
  }
};

const verifyAccount = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email);
    if (!existUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (existUser.verifyToken !== reqBody.token) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid token");
    }
    if (existUser.isActive)
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Account already active");
    const updatedUser = await userModel.updateOneById(existUser._id, {
      isActive: true,
      verifyToken: null,
    });
    return pickUser(updatedUser);
  } catch (error) {
    throw error;
  }
};

const login = async (reqBody) => {
  const existUser = await userModel.findOneByEmail(reqBody.email);
  if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  if (!existUser.isActive)
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Account not active");
  const isPasswordCorrect = bcrypt.compareSync(
    reqBody.password,
    existUser.password
  );
  if (!isPasswordCorrect)
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Invalid password");
  // Nếu ok thì tạo Tokens đăng nhập và trả về FE
  // Tạo thông tin đính kèm trong JWT Token bao gồm ._id và email
  const userInfo = {
    _id: existUser._id,
    email: existUser.email,
  };
  // Tạo ra 2 loại token, accessToken và refreshToken trả về cho FE
  const accessToken = await JwtProvider.generateToken(
    userInfo,
    env.ACCESS_TOKEN_SECRET,
    env.ACCESS_TOKEN_LIFE
  );
  const refreshToken = await JwtProvider.generateToken(
    userInfo,
    env.REFRESH_TOKEN_SECRET,
    env.REFRESH_TOKEN_LIFE
  );

  // Trả về thông tin của user kèm theo 2 token vừa tạo
  return {
    user: pickUser(existUser),
    accessToken,
    refreshToken,
  };
  
};


export const userService = {
  createNew,
  verifyAccount,
  login,
};
