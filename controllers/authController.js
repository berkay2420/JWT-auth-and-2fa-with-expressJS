const JWT_SECRET = process.env.SECRET_KEY;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const {sendOTPVerificationEmail} = require('../controllers/mailController');
const {UserOTPVerification} = require('../model/userOTPVerification');
const User = require('../model/user');

require('dotenv').config();

const login = async (req, res, next) => {
  let {email, password} = req.body;

  if (!email || !password) 
    return res.status(400).json({ status: "FAILED", message: "Email and password required" });

  let existingUser = await User.findOne({email});

  if (!existingUser) 
    return res.status(400).json({ status:"FAILED", message:"User not found" });


  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if (!isValidPassword)
      return res.status(400).json({ status: "FAILED", message: "Wrong password" });

  await sendOTPVerificationEmail({ userId: existingUser._id, email: existingUser.email });

  try {
    res.status(200).json({
      status: "PENDING",
      message: "OTP sent to email. Please verify to complete login.",
      data: {
        userId: existingUser._id,
        email: existingUser.email,
      },
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED", message: error.message });
  }
}


const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ status: "FAILED", message: "User ID and OTP required"});
    }

    const userRecords = await UserOTPVerification.find({ userId });
    if (!userRecords || userRecords.length === 0) {
      return res.status(400).json({ status: "FAILED", message: "No OTP request found" });
    }

    const { expiresAt, otp: hashedOTP } = userRecords[0];

    if (expiresAt < Date.now()) {
      await UserOTPVerification.deleteMany({ userId });
      return res.status(400).json({
        status: "FAILED",
        message: "The verification code has expired. Please request a new one"
      });
    }

    const isValidOTP = await bcrypt.compare(otp, hashedOTP);
    if (!isValidOTP) {
      return res.status(400).json({ status: "FAILED", message: "Invalid verification code" });
    }

    // Delete records if OTP correct
    await UserOTPVerification.deleteMany({ userId });

    const user = await User.findById(userId);
    //Create JWT 
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "SUCCESS",
      message: "OTP verified successfully",
      data: { userId: user._id, email: user.email, token }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED", message: error.message });
  }
};

module.exports = {login, verifyOTP};