const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required : true,
    unique: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  role: {type: String, default: "user"},
  games: {
    type: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      }
    ],
    default: []
  },
  refreshToken: String,
  twoFactorAuthToken: String,
  twoFactorAuthQR: String
})

module.exports = mongoose.model("User", userSchema);
