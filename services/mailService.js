const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require('dotenv').config();

const {UserOTPVerification} = require('../models/userOTPVerification');

const SENDER_ADDRESS = process.env.SMTP_SENDER_MAIL_ADDRESS;

const transport = nodemailer.createTransport({
  service: "gmail",
  auth:{
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

async function sendMail({to, html, subject="Verification Code"}){
  try {
    await transport.sendMail({
      from: SENDER_ADDRESS,
      to,
      subject,
      html
    });
    console.log("Verification Mail Sent Successfully");
  } catch (err) {
    console.log(`Error while sending verification mail: ${err}`);
  }
}

const sendOTPVerificationEmail = async ({ userId, email }) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const mailOptions = {
    to: email,
    html: `<p>This is your verification code for login <b>${otp}</b> </p>`
  };

  const hashedOTP = await bcrypt.hash(otp, 10);
  const newOTPVerification = new UserOTPVerification({
    userId,
    otp: hashedOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  await newOTPVerification.save();
  await sendMail(mailOptions);
};

const sendVerificationEmail = async ({ userId, email }) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  const mailOptions = {
    to: email,
    html: `<p>This is your verification code for login <b>${otp}</b> </p>`
  };

  const hashedOTP = await bcrypt.hash(otp, 10);
  const newOTPVerification = new UserOTPVerification({
    userId,
    otp: hashedOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000
  });

  await newOTPVerification.save();
  await sendMail(mailOptions);
};


module.exports = {sendOTPVerificationEmail, sendVerificationEmail};