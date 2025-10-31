const express = require("express");
const router=express.Router();

const {registerNewUser, deleteUser, listUsers, addNewGame, getUser, listGames} = require('../controllers/userController');
const {authenticateToken, decodeJWT, verifyJWT} = require('../middleware/middleware');

router.post('/register', registerNewUser);
router.get("/gamesList", listGames);

//after this line use verifyJWT 
router.use(verifyJWT);

router.get("/userList", listUsers);
router.delete("/deleteUser", deleteUser);
router.post("/addNewGame", addNewGame);
router.get("/user", getUser);


module.exports = router;