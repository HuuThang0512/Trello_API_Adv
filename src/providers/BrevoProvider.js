// Lưu ý Brevo là tên thương hiệu mới của sib - Sendinblue
// Vì thế trong phần hướng dẫn trên github có thể nó vẫn còn giữ tên biến SibApiV3Sdk
// https://github.com/getbrevo/brevo-node
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

/**
* Có thể xem thêm phần docs cấu hình theo từng ngôn ngữ khác nhau tùy dự án ở Brevo Dashboard > Account >
SMTP & API > API Keys
* https://brevo.com
* Với Nodejs thì tốt nhất cứ lên github repo của bọn nó là nhanh nhất:
* https://github.com/getbrevo/brevo-node
*/
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY


const sendEmail = async (toEmail, customSubject, customHtmlContent) => {
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  // Tài khoản gửi mail
  sendSmtpEmail.sender = { name: env.ADMIN_EMAIL_NAME, email: env.ADMIN_EMAIL_ADDRESS }
  // Những tài khoản nhận mail
  sendSmtpEmail.to = [{ email: toEmail }]
  // Tiêu đề mail
  sendSmtpEmail.subject = customSubject;
  // Nội dung mail dạng html
  sendSmtpEmail.htmlContent = customHtmlContent;

  try {
    return await apiInstance.sendTransacEmail(sendSmtpEmail)
  } catch (error) {
    throw error
  }
}

export const BrevoProvider = {
  sendEmail
}