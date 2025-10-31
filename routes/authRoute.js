const express = require("express");
const router=express.Router();

const{login, verifyEmail, verifyOTP, verifyEmailOTP} = require('../controllers/authController')
const {authenticateToken, verifyJWT} = require('../middleware/middleware');

router.post('/login', login);

router.post('/verify-2fa', verifyOTP);

router.post('/verify-email', verifyEmail);

router.post('/verify-emailOTP', verifyEmailOTP);

module.exports = router;