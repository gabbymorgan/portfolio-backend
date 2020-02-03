const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

async function sendMail({to, subject, text}) {
  let testAccount = await nodemailer.createTestAccount();

  const emailTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.com",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  await emailTransporter.sendMail({
    to,
    subject,
    text
  });
}

  const messageRouter = require("./data/routes/messages");

  mongoose
    .connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-h73bz.mongodb.net/test?retryWrites=true&w=majority`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => {
      console.log("~~~ connected to db ~~~");
    })
    .catch(err => {
      console.log(err);
    });

  const server = express();
  server.use(helmet());
  server.use(express.json());
  server.use(cors());
  server.use(
    morgan("method :url :status :res[content-length] - :response-time ms")
  );
  server.use("/messages", messageRouter);

  server.get("/", async (req, res) => {
    res.status(200).json("Hello squirrel");
    await sendMail({
      to: process.env.EMAIL_RECIPIENT,
      subject: "Direct API accesss",
      text: "Someone is hitting up your API directly"
    });
  });

  server.listen(process.env.PORT, () => {
    console.log(`LISTENING ON PORT ${process.env.PORT}`);
  });

module.exports = { sendMail }

