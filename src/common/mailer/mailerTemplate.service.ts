import { Injectable } from '@nestjs/common';
import { mailerTemplateDto } from './mailer.dto';

@Injectable()
export class MailerTemplateService {
  constructor() {}
  async forgetMailTemplate({ resetPasswordUrl }): Promise<mailerTemplateDto> {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td style="padding: 40px 10px;" align="center">
        <table role="presentation" width="100%" style="max-width: 500px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px; text-align: center;">Reset Your Password</h2>
              
              <p style="margin: 0 0 25px; color: #4a4a4a; font-size: 16px; line-height: 1.5; text-align: center;">
                We received a request to reset your password. Click the button below to choose a new one.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <a href=${resetPasswordUrl} style="display: inline-block; padding: 14px 30px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 0; color: #888888; font-size: 14px; line-height: 1.5; text-align: center;">
                This link will expire in 15 minutes. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>

        <table role="presentation" width="100%" style="max-width: 500px;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding: 20px; text-align: center; color: #999999; font-size: 12px;">
              &copy; 2026 Taskflow. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return { html, subject: 'Forget Password' };
  }

  async welcomeMailTemplate(name: string): Promise<mailerTemplateDto> {
    const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
  <h2 style="color: #333;">Welcome to the Team, ${name}! 🚀</h2>
  <p>We're excited to help you get organized. Your account is now active and ready for your first task.</p>
  <p style="margin: 20px 0; color: #444;">
    You can now log in and start creating and tracking your tasks.
  </p>

  <p style="font-size: 14px; color: #666;">
    If you have any questions, just reply to this email. We're here to help!
  </p>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="font-size: 12px; color: #999;">Sent via TaskManager Pro Mailing Service</p>
</div>`;

    return { html, subject: 'Welcome to Taskflow 🚀' };
  }
}
