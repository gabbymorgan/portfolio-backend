const express = require("express");
const nodemailer = require("nodemailer");
const uuidV4 = require("uuid/v4");
const Message = require("../models/message");
const User = require("../models/user");

const router = express.Router();

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

router
  .post("/", async (req, res) => {
    try {
      const { message, token } = req.body;
      const newMessage = new Message({ content: message, token });
      const savedMessage = await newMessage.save();
      res.status(200).json({ savedMessage });
      await transporter.sendMail({
        to: process.env.EMAIL_RECIPIENT,
        subject: "New message from gabriellapelton.com",
        text: `user: ${token}\n\nmessage: ${message}`
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  })
  .get("/token", async (req, res) => {
    const token = uuidV4();
    const newUser = new User({token});
    res.status(200).json({ token });
    await newUser.save();
    await transporter.sendMail({
      to: process.env.EMAIL_RECIPIENT,
      subject: "New user token created",
      text: "A new user has visited the site"
    });
  })
  .get("/mine", async (req, res) => {
    try {
      const { token } = req.query;
      const messages = await Message.find({ token });
      res.status(200).json({ messages });
      await transporter.sendMail({
        to: process.env.EMAIL_RECIPIENT,
        subject: "A visitor returns",
        text: `User ${token} has returned`
      });
    } catch (err) {
      res.status(500).json({ error });
    }
  });

module.exports = router;
