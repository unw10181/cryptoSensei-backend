const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String },
});
