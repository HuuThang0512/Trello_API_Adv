import { StatusCodes } from "http-status-codes";
import { userService } from "~/services/userService";
import ms from "ms";

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body);
    res.status(StatusCodes.CREATED).json(createdUser);
  } catch (error) {
    next(error);
  }
};

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    // xử lý trả về http only cookie cho phía trình duyệt
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true, //Phía server sẽ quản lý cookie, FE sẽ không động vào
      secure: true,
      sameSite: "none", // Mỗi máy có 1 domain khác nhau
      maxAge: ms("14 days"), // 1 ngày
    });
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true, //Phía server sẽ quản lý cookie, FE sẽ không động vào
      secure: true,
      sameSite: "none", // Mỗi máy có 1 domain khác nhau
      maxAge: ms("14 days"), // 1 ngày
    });
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const userController = {
  createNew,
  verifyAccount,
  login,
};
