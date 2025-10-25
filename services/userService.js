const User = require("../model/user");
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

module.exports = {registerUserService ,deleteUserService, listUsersService};