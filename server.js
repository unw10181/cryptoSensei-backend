require("dotenv").config();

const express = require("express");
const connectDb = require("./config/db");

const app = express();
connectDb();

app.express();
app.use(express.urlencoded({ extended: true }));

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
