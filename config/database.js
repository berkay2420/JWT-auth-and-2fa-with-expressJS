const mongoose = require("mongoose");
const { db } = require("../model/user");

require('dotenv').config();

const DB_URL = process.env.MONGO_DB_ATLAS_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connected to the MongoDB Atlas");
  } catch (error) {
    console.error(`Error while connecting to the database `,error);
    process.exit(1);
  } 
}

function getDB() {
  return db;
}

module.exports = {connectDB, getDB};