const {registerUserService, deleteUserService, listUsersService} = require("../services/userService");

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


module.exports = {registerNewUser,listUsers, deleteUser};