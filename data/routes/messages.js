const express = require("express");
const uuidV4 = require("uuid/v4");
const moment = require("moment");
const Message = require("../models/message");
const User = require("../models/user");
const { emailTransporter } = require("../../utils/communications");

const router = express.Router();

router
  .post("/", async (req, res) => {
    try {
      const { message, token } = req.body;
      const newMessage = new Message({ content: message, token });
      const savedMessage = await newMessage.save();
      const foundUser = await User.findOne({ token });
      foundUser.messages.push(savedMessage._id);
      res.status(200).json({ savedMessage });
      await emailTransporter.sendMail({
        to: process.env.EMAIL_RECIPIENT,
        subject: `New message from ${token}`,
        text: `user: ${token}\n\nmessage: ${message}`,
      });
      await foundUser.save();
    } catch (err) {
      console.log(err);
    }
  })
  .get("/token", async (req, res) => {
    const token = uuidV4();
    const visitedOn = Date.now();
    const newUser = new User({
      token,
      visits: [visitedOn],
      lastVisited: visitedOn,
    });
    res.status(200).json({ token });
    await newUser.save();
    await emailTransporter.sendMail({
      to: process.env.EMAIL_RECIPIENT,
      subject: "New user token created",
      text: "A new user has visited the site",
    });
  })
  .get("/mine", async (req, res) => {
    try {
      const { token } = req.query;
      const foundUser = await User.findOne({ token }).populate("messages");
      if (!foundUser) {
        return res.status(404).json({ message: "No user found." });
      }
      let { messages, lastVisited, visits, guessWho } = foundUser;
      res.statufews(200).json({ messages });
      if (moment().startOf("day").isAfter(lastVisited)) {
        await emailTransporter.sendMail({
          to: process.env.EMAIL_RECIPIENT,
          subject: `${guessWho || token} returns`,
          text: `User ${token} has returned`,
        });
      }
      lastVisited = Date.now();
      visits.push(lastVisited);
      await foundUser.update({ lastVisited, visits });
    } catch (err) {
      console.log(err);
    }
  });

module.exports = router;
