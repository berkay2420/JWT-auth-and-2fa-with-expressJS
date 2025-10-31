const {
  registerUserService,deleteUserService,
  listUsersService, 
  addGamesService,
  getUserService,
  listGamesService} = require("../services/userService");

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
  const isVerified = req.isVerified;
  if (!isVerified) return res.status(403).json({ message: "UNABLE TO ADD NEW GAME PLEASE VERIY EMAİL"});
  try {
    const user = await addGamesService(userId, game);
    return res.status(200).json({ message: "New Game Added", gameslist: user.games});
  } catch (error) {
    console.error(`Error while adding new game: ${error}:` );
    return res.status(500).json({ error: "Failed to add new game" });
    
  }
}

const listGames = async (req, res) => {
  const userId = req.userId;
  try {
    let user = await listGamesService(userId);
    return res.status(200).json({message:`Game list`, gameslist: user.games});
  } catch (error) {
    console.error(`Error while listing games: ${error}:` );
    return res.status(500).json({ error: "Failed to list games" });
  }
  
}

const getUser = async (req, res) => {
  try {
    const userId = req.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const user = await getUserService(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Current User", user });
  } catch (error) {
    console.error(`Error while fetching user: ${error}`);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

module.exports = {registerNewUser,listUsers, deleteUser, addNewGame, getUser, listGames};