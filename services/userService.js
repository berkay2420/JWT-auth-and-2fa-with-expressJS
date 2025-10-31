const User = require("../models/user");
const {ObjectId} = require("mongodb");
const bcrypt = require("bcrypt");
const { db } = require("../config/database");

require('dotenv').config();

const registerUserService = async (name, email, password, role) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role
      }); 
      await newUser.save();
  return newUser
};

const listUsersService = async () => {
  const users = await User.find();
  return users;
}

const deleteUserService = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  return user;
}

const addGamesService = async (userId, game) => {
  const currentUser = await User.findById(userId);
  currentUser.games.push(...game);
  await currentUser.save();
  return currentUser;
};

const listGamesService = async (userId) => {
  const {games} = await User.findById(userId).select("games");
  return {games};
}

const getUserService = async(userId) =>{
  const currentUser = await User.findById(userId);
  return currentUser;
}
module.exports = {registerUserService ,deleteUserService, listUsersService, addGamesService, getUserService, listGamesService};