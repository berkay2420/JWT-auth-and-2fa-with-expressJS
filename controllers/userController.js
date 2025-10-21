const User = require('../model/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const {getAllUsers} = require("../config/database");
require('dotenv').config();

const JWT_SECRET = process.env.SECRET_KEY;

const registerNewUser = async (req, res) =>{
  const {name, email, password, role} = req.body;

  if(!name || !email || !password) return res.status(400).json({'message':"name, email and password required"});

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    }); 
    await newUser.save();

    res.status(201).json({'success':`new user: ${newUser} created`});
  } catch (error) {
    res.status(500).json({'message':`${error}`});
  
  }
}


const listUsers = async (req, res) =>{
  const users = await getAllUsers();
  if(users){
    res.status(200).json(users);
  } 
}

module.exports = {registerNewUser,listUsers};