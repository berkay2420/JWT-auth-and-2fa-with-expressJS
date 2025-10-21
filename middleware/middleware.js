const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const JWT_SECRET = process.env.SECRET_KEY;

//middleware for token authentication
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

module.exports = {authenticateToken};
