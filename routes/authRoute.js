const express = require("express");
const router=express.Router();

const{login} = require('../controllers/authController')
const {authenticateToken} = require('../middleware/middleware');
const {verifyOTP} = require('../controllers/authController');

router.post('/login', login);

router.post('/verifyOTP', verifyOTP);

module.exports = router;