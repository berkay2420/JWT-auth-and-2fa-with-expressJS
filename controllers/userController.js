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

const login = async (req, res, next) => {
  let {email, password} = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({email: email});
  } catch  {
    const error = new Error(
      "Erorr! User not exists"
    );
    return next(error);
  }
  if (!existingUser) {
    const error = new Error("User not found with this email.");
    return next(error);
  }
  const isValidPassword = await bcrypt.compare(password, existingUser.password);

  if(!isValidPassword){
    const error = new Error(
      "Wrong Password"
    );
    return next(error);
  }
  let token;
  let secret;
  let imageUrl;

  try {
    //creating JWT token
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      },
      JWT_SECRET,
      {expiresIn: "1h"}
    );

    //generating secret and qr for 2fa
    secret = speakeasy.generateSecret({length:20});

    imageUrl = await qrcode.toDataURL(secret.otpauth_url);

  } catch (error) {
    console.log(error);
    const err = new Error(
      "Error! Something went wrong."
    );
    return next(err);
  }
  existingUser.twoFactorAuthToken = secret.base32;
  await existingUser.save();
  
  res
    .status(200)
    .json({success:true,
      data: {
        userId: existingUser.id,
        email: existingUser.email,
        token: token,
        twoFactorAuthTokenQR: imageUrl,
        secret: secret.base32
      }
    });

}

//middleware for authentication
function authenticateToken(req, res, next){
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if(!token) return res.status(401).json({'message':"Please provide auth token"});

  jwt.verify(token, JWT_SECRET, (err, user)=>{
    if(err) return res.status(401).json({'message':`Error: ${err}`});

    const userRole = user.role;
    if(userRole == "admin"){
      next();
    }else {
      return res.status(403).json({'message': "Access denied"});
    }
  });
};

const listUsers = async (req, res) =>{
  const users = await getAllUsers();
  if(users){
    res.status(200).json(users);
  } 
}

module.exports = {registerNewUser, login, listUsers, authenticateToken};