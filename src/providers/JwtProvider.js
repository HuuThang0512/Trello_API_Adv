import JWT from "jsonwebtoken";


/** Function tạo mới token, cần 3 tham số đầu vào
 * + userInfo: Những thông tin muốn đính kèm vào token
 * + secretSignature: Chữ bí mật(dạng string ngẫu nhiên) trên docs họ để tên là privateKey
 * + tokenLife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfo, secretSignature, {
      algorithm: "HS256",
      expiresIn: tokenLife,
    });
  } catch (error) {
    throw error;
  }
};

/** Function kiểm tra token có hợp lệ hay không
 * Hợp lệ khi token được tạo ra có đúng với cái secretSignature của dự án hay không
 */
const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw error;
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken,
};