const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  content: String,
  token: String,
  createdOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Message", MessageSchema);
