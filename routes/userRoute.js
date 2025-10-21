const express = require("express");
const router=express.Router();

const {registerNewUser, login, listUsers} = require('../controllers/userController');
const {authenticateToken} = require('../middleware/middleware');

router.post('/register', registerNewUser);

router.get('/users', authenticateToken, listUsers);


module.exports = router;