const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  token: String,
  createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
