require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { sendOTPVerificationEmail, sendVerificationEmail } = require('../services/mailService');
const { UserOTPVerification } = require('../models/userOTPVerification');
const User = require('../models/user');

const JWT_SECRET = process.env.SECRET_KEY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

const loginService = async (email, password) => {
  let existingUser = await User.findOne({ email });
  if (!existingUser) throw new Error("User Not Exists");

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  if (!existingUser.verified) {
    return { status: "UNVERIFIED", existingUser };
  }

  if (existingUser.verified && existingUser.enable2fa) {
    await sendOTPVerificationEmail({ userId: existingUser._id, email: existingUser.email });
    return { status: "2FA_PENDING", existingUser };
  }

  const accessToken = jwt.sign(
    {
      userId: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
      verified: existingUser.verified,
      enable2fa: existingUser.enable2fa
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    { userId: existingUser._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { status: "SUCCESS", existingUser, accessToken, refreshToken };
};

const verifyOTPService = async (userId, otp) => {
  const userRecords = await UserOTPVerification.find({ userId });
  if (!userRecords || userRecords.length === 0) throw new Error("No OTP request found");

  const { expiresAt, otp: hashedOTP } = userRecords[0];
  if (expiresAt < Date.now()) {
    await UserOTPVerification.deleteMany({ userId });
    throw new Error("The verification code has expired. Please request a new one");
  }

  const isValidOTP = await bcrypt.compare(otp, hashedOTP);
  if (!isValidOTP) throw new Error("Invalid verification code");

  await UserOTPVerification.deleteMany({ userId });

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found after OTP verification");

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      enable2fa: user.enable2fa
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};

const verifyEmailService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  await sendOTPVerificationEmail({ userId: user._id, email: user.email });
  return user;
};

const verifyEmailOTPService = async (userId, otp) => {
  const userRecords = await UserOTPVerification.find({ userId });
  if (!userRecords || userRecords.length === 0) throw new Error("No OTP request found");

  const { expiresAt, otp: hashedOTP } = userRecords[0];
  if (expiresAt < Date.now()) {
    await UserOTPVerification.deleteMany({ userId });
    throw new Error("The verification code has expired. Please request a new one");
  }

  const isValidOTP = await bcrypt.compare(otp, hashedOTP);
  if (!isValidOTP) throw new Error("Invalid verification code");

  await UserOTPVerification.deleteMany({ userId });

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found after email OTP verification");

  user.verified = true;
  await user.save();

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      enable2fa: user.enable2fa
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};

const enable2FAService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.enable2fa = true;
  await user.save();

  const accessToken = jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      enable2fa: user.enable2fa
    },
    JWT_SECRET,
    { expiresIn: "5m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, user };
};

const refreshTokenService = async (token) => {
  if (!token) throw new Error("Refresh token is required");

  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) throw new Error("User not found");

    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        verified: user.verified,
        enable2fa: user.enable2fa
      },
      JWT_SECRET,
      { expiresIn: "5m" }
    );

    return { accessToken: newAccessToken };
  } catch (err) {
    throw new Error("Invalid or expired refresh token");
  }
};

module.exports = {
  loginService,
  verifyOTPService,
  verifyEmailService,
  verifyEmailOTPService,
  enable2FAService,
  refreshTokenService
};
