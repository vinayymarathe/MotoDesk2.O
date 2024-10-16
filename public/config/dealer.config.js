const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb+srv://nakshatra4585:V3kE48RuIIODCzgr@cluster0.opjyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

connect.then(() => {
    console.log("Database Connected");
})
.catch(() => {
    console.log("Database Not Connected");
})

const dealerSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
});

const dealer = new mongoose.model("users", dealerSchema);

module.exports = dealer;
