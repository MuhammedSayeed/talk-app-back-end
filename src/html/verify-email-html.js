function VerifyEmailHtml(verificationCode) {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff;">
          <!-- Header with Logo -->
          <tr>
              <td align="center" style="padding: 40px 20px 30px 20px;">
                  <!-- Logo Placeholder - Replace with your actual logo -->
                  <img src="https://res.cloudinary.com/dndjbkrcv/image/upload/v1738893183/talk-logo-light-theme_sgjkdu.png" alt="talk Logo" width="180" height="60" style="display: block; border: 0;" />
  
              </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
              <td style="padding: 20px 30px 40px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                          <td style="padding: 0 0 20px 0; font-size: 24px; font-weight: bold; text-align: center; color: #ffffff;">
                              Reset Your Password
                          </td>
                      </tr>
                      <tr>
                          <td style="padding: 0 0 30px 0; line-height: 1.6; color: #cccccc; text-align: center;">
                              We received a request to reset your password. If you didn't make this request, you can safely ignore this email. Otherwise, use the verification code below to create a new password.
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="padding: 0 0 30px 0;">
                              <!-- Verification Code Display -->
                              <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 4px; padding: 20px; display: inline-block; margin: 0 auto;">
                                  <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1bbf54;">${verificationCode}</span>
                              </div>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
  
      </table>
  </body>
  </html>`
  }
  
  export { VerifyEmailHtml }