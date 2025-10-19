const express = require("express");
const userRoute = require('./routes/userRoute');

const {connectDB} = require('./config/database');
require('dotenv').config();

const app = express();
app.use(express.json())

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`The server started listening on port ${PORT}`);
});

app.get("/",(req,res)=>{
  res.send("Hello world");
});

app.use("/api", userRoute);
