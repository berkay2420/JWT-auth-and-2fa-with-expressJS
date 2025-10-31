const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date
});

const UserOTPVerification = mongoose.model("UserOTPVerification", otpSchema);

module.exports = {UserOTPVerification};