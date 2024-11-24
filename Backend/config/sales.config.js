const mongoose = require("mongoose");
require("dotenv").config();

const connect = mongoose.connect(process.env.MONGO_STRING);

connect
  .then(() => {
    console.log("Database Connected");
  })
  .catch(() => {
    console.log("Database Not Connected");
  });

// Updated Sales Schema with a logical clock
const SalesSchema = new mongoose.Schema({
  dealer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
    enum: ["top", "mid", "base"],
  },
  costPrice: {
    type: Number,
    required: true,
  },
  sellPrice: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    default: "NA",
  },
  profit: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Number,
    required: true, // Logical clock value
  },
});

const Sales = mongoose.model("sales", SalesSchema);
module.exports = Sales;
