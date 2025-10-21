const express = require("express");
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');

const {connectDB} = require('./config/database');
require('dotenv').config();

const app = express();
app.use(express.json())

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log(`The server started listening on port ${PORT}`);
});

app.use("/api", userRoute);
app.use("/auth", authRoute);
app.use(express.static("public"));
