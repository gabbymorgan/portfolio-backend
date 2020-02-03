const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

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

server.listen(process.env.PORT, () => {
  console.log(`LISTENING ON PORT ${process.env.PORT}`);
});
