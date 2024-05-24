
import nodemailer from 'nodemailer';



export const sendmail =(data)=>{
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: '75556e001@smtp-brevo.com', // your SendinBlue SMTP username
      pass: 'LA7axPKO9UD0N2B5'  // your SendinBlue SMTP password
    }
  });

  // Define the email options
  const mailOptions = {
    from: 'testing@gmail.com', // sender address
    to: data.email,    // list of receivers
    subject: 'Your OTP Code',  // Subject line
    text: 'OTP ', // plain text body
    html:`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                padding: 10px 0;
            }
            .header img {
                width: 100px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content h1 {
                color: #333333;
            }
            .otp-code {
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                background-color: #4CAF50;
                padding: 10px 20px;
                border-radius: 4px;
                display: inline-block;
                margin: 20px 0;
            }
            .footer {
                text-align: center;
                padding: 10px;
                font-size: 12px;
                color: #888888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3_32Em8Yev8nuFwdsp-7CPBr-u61bH4Syqfm4QaYFrA&s" alt="Company Logo">
            </div>
            <div class="content">
                <h1>Your OTP Code</h1>
                <p>Use the following One-Time Password (OTP) to complete your transaction:</p>
                <div class="otp-code">${data.otp}</div>
                <p>This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
            <div class="footer">
                &copy; 2024 Your Company Name. All rights reserved.
            </div>
        </div>
    </body>
    </html>
  `
   
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
}
