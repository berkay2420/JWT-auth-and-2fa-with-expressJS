const express = require("express");
const router=express.Router();

const {registerNewUser, deleteUser, listUsers, addNewGame, getUser} = require('../controllers/userController');
const {authenticateToken, decodeJWT, verifyJWT} = require('../middleware/middleware');

router.post('/register', registerNewUser);

router.get('/userList', authenticateToken, listUsers);

router.delete('/deleteUser', authenticateToken, deleteUser);

router.post('/addNewGame', verifyJWT ,addNewGame);

router.get('/me', verifyJWT, getUser);

module.exports = router;