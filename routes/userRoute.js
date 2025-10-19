const express = require("express");
const router=express.Router();

const {registerNewUser, login, listUsers, authenticateToken} = require('../controllers/userController');

router.post('/register', registerNewUser);

router.post('/login', login);

router.get('/users', authenticateToken, listUsers);


module.exports = router;