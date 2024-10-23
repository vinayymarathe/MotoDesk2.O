const mongoose = require("mongoose");
require('dotenv').config();

const connect = mongoose.connect(process.env.MONGO_STRING)

connect.then(() => {
    console.log("Database Connected");
})
.catch(() => {
    console.log("Database Not Connected");
})

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    car: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    status: { type: String, required: true },
});

const Customers = new mongoose.model("Customers",CustomerSchema);
module.exports=Customers;