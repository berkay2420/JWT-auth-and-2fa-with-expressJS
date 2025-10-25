const mongoose = require("mongoose");
const Chance = require("chance");
const User = require("../model/user");

const {connectDB} = require('../config/database');

connectDB();

require('dotenv').config();

const chance = new Chance();
const generateUsers = async (count=1000) => {
  const users = [];

  for(let i=0; i<count; i++){
    users.push({
      name: chance.name(),
      email: chance.email(),
      password: "hashedpassword",
      role: "user",
    });
  }
  await User.insertMany(users);
  console.log(`${count} users added`);
  process.exit();
}

generateUsers(10000);