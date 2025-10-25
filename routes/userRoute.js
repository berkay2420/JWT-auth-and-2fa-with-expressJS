const express = require("express");
const router=express.Router();

const {registerNewUser, deleteUser, listUsers} = require('../controllers/userController');
const {authenticateToken} = require('../middleware/middleware');

router.post('/register', registerNewUser);

router.get('/users', authenticateToken, listUsers);

router.delete('/deleteUser', authenticateToken, deleteUser);

module.exports = router;