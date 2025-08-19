import { StatusCodes } from "http-status-codes";
import { JwtProvider } from "~/providers/JwtProvider";
import { env } from "~/config/environment";
import ApiError from "~/utils/ApiError";

// Middleware này đảm nhiệm việc quan trọng: Xác thực cái JWT accessToken nhận được từ FE đẩy lên xem có hợp lệ không

const isAuthoried = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía client - withCredentials: true trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken;
  if (!clientAccessToken) {
    next(
      new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized(Token not found)")
    );
    return;
  }
  try {
    // B1: Thực hiện giải mã token xem nó có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET
    );
    // B2: Quan trọng: Nếu như token hợp lệ thif phải lưu thông tin giải mã được vào req.jwtDecoded, để sử dụng cho các tầng xử lí ở phía sau
    req.jwtDecoded = accessTokenDecoded;
    // B3: Cho phép request được tiếp tục
    next();
  } catch (error) {
    // Nếu accessToken hết hạn thì cần trả về 1 mã lỗi để FE biết để gọi api refreshToken - mã lỗi 410 - GONE
    if (error?.message.includes("jwt expired")) {
      next(new ApiError(StatusCodes.GONE, "Need to refresh token"));
      return;
    }
    // Nếu AT không hợp lệ thì trả về lỗi 401 cho sign_out luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized"));
  }
};
export const authMiddleware = {
  isAuthoried,
};
