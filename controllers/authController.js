const {
  loginService,
  verifyOTPService,
  verifyEmailService,
  verifyEmailOTPService,
  enable2FAService,
  refreshTokenService 
} = require("../services/authService");

require('dotenv').config();

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: "FAILED", message: "Email and password required" });
  }

  try {
    const result = await loginService(email, password);

    if (result.status === "SUCCESS") {
      
      return res.status(200).json({
        status: "SUCCESS",
        message: "User logged in successfully.",
        data: {
          userId: result.existingUser._id,
          email: result.existingUser.email,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        },
      });
    }

    if (result.status === "2FA_PENDING") {
      return res.status(200).json({
        status: "2FA_PENDING",
        message: "OTP sent for 2FA verification.",
        data: {
          userId: result.existingUser._id,
          email: result.existingUser.email,
        },
      });
    }

    if (result.status === "UNVERIFIED") {
      return res.status(200).json({
        status: "UNVERIFIED",
        message: "User not verified. Please verify your email.",
        data: {
          userId: result.existingUser._id,
          email: result.existingUser.email,
        },
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "FAILED", message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ status: "FAILED", message: "User ID and OTP required" });
    }

    const { accessToken, refreshToken, user } = await verifyOTPService(userId, otp);

    res.status(200).json({
      status: "SUCCESS",
      message: "OTP verified successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED", message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await verifyEmailService(userId);

    res.status(200).json({
      status: "PENDING",
      message: "OTP sent to email. Please verify to complete login.",
      data: {
        userId: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED", message: error.message });
  }
};

const verifyEmailOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ status: "FAILED", message: "User ID and OTP required" });
    }

    const { accessToken, refreshToken, user } = await verifyEmailOTPService(userId, otp);

    res.status(200).json({
      status: "SUCCESS",
      message: "OTP verified successfully",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED", message: error.message });
  }
};

const enable2fa = async (req, res) => {
  const userId = req.userId; 

  if (!userId) {
    return res.status(400).json({ status: "FAILED", message: "User ID required" });
  }

  try {
    const { accessToken, refreshToken, user } = await enable2FAService(userId);
    return res.status(200).json({
      status: "SUCCESS",
      message: "2FA successfully enabled",
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "FAILED to enable 2FA", message: error.message });
  }
};


const refreshToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ status: "FAILED", message: "Refresh token is required" });
  }

  try {
    const { accessToken } = await refreshTokenService(token);

    return res.status(200).json({
      status: "SUCCESS",
      message: "Access token refreshed",
      data: { accessToken }
    });

  } catch (error) {
    console.log(error);
    return res.status(401).json({ status: "FAILED", message: error.message });
  }
};

module.exports = {
  login,
  verifyOTP,
  verifyEmail,
  verifyEmailOTP,
  enable2fa,
  refreshToken 
};
