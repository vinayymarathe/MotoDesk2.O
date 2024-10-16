const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb+srv://nakshatra4585:V3kE48RuIIODCzgr@cluster0.opjyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

connect.then(() => {
    console.log("Database Connected");
})
.catch(() => {
    console.log("Database Not Connected");
})

const InventorySchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  vin: {
    type: String,
    unique: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  mileage: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'maintenance'],
    default: 'available',
  },
  // dealer: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Dealer',
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Inventory = new mongoose.model("inventory",InventorySchema);
module.exports = Inventory;