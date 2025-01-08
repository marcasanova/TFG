const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

const sendResetPasswordEmail = (user, token) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: user.email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: http://localhost:3000/reset-password?token=${token}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

module.exports = { sendResetPasswordEmail };
