const {
  registerUserService,deleteUserService,
  listUsersService, 
  addGamesService,
  getUserService} = require("../services/userService");

const registerNewUser = async (req, res) =>{
  const {name, email, password, role} = req.body;

  if(!name || !email || !password) return res.status(400).json({'message':"name, email and password required"});

  try {
    const newUser = await registerUserService(name, email, password, role)
    await newUser.save();

    res.status(201).json({'success':`new user: ${newUser} created`});
  } catch (error) {
    res.status(500).json({'message':`${error}`});
  
  }
}

const listUsers = async (req, res) =>{
  const users = await listUsersService();
  if(users){
    res.status(200).json(users);
  } 
}

const deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    const deletedUser = await deleteUserService(userId);
    return res.status(200).json({ message: "User deleted", user: deletedUser.value });
  } catch (error) {
    console.error(`Error while deleting user erorr: ${error}:` );
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

const addNewGame = async(req, res) => {
  const { game } = req.body;
  const userId = req.userId;
  try {
    const user = await addGamesService(userId, game);
    return res.status(200).json({ message: "New Game Added", gameslist: user.games});
  } catch (error) {
    console.error(`Error while adding new game: ${error}:` );
    return res.status(500).json({ error: "Failed to add new game" });
    
  }
}

const getUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await getUserService(userId);
    return res.status(200).json({ message: "Current User", user: user});
  } catch (error) {
    console.error(`Error while adding new game: ${error}:` );
    return res.status(500).json({ error: "Failed to add new game" });
    
  }
}
module.exports = {registerNewUser,listUsers, deleteUser, addNewGame, getUser};