const JWT_SECRET = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {sendOTPVerificationEmail} = require('../services/mailService');
const {UserOTPVerification} = require('../model/userOTPVerification');
const User = require('../model/user');

require('dotenv').config();

const loginService =  async (email, password) => {
  let existingUser = await User.findOne({email});
  if (!existingUser) throw new Error("User Not Exists");
  
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) throw new Error("Invalid password");
  
  await sendOTPVerificationEmail({ userId: existingUser._id, email: existingUser.email });

  return existingUser;
}

const verifyOTPService = async (userId, otp) => {

  const userRecords = await UserOTPVerification.find({ userId });
  if (!userRecords || userRecords.length === 0) throw new Error("No OTP request found");

  const {expiresAt, otp: hashedOTP} = userRecords[0];
  if (expiresAt < Date.now()) {
    await UserOTPVerification.deleteMany({ userId });
    throw new Error("The verification code has expired. Please request a new one");
  }

  const isValidOTP = await bcrypt.compare(otp, hashedOTP);
  if (!isValidOTP) throw new Error("Invalid verification code")

  // Delete records if OTP correct
  await UserOTPVerification.deleteMany({ userId });
  
  const user = await User.findById(userId);

  //Create JWT 
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
  );

  return {token, user};

}

module.exports = {loginService, verifyOTPService}