const {loginService, verifyOTPService} = require("../services/authService");

require('dotenv').config();

const login = async (req, res) => {
  let {email, password} = req.body;

  if (!email || !password) 
    return res.status(400).json({ status: "FAILED", message: "Email and password required" });

  try {
    const existingUser = await loginService(email, password);
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

    const {token, user} = await verifyOTPService(userId, otp);

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