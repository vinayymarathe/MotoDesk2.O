const express = require("express");
// const bcrypt = require("bcrypt");
const path = require("path");
const dealer = require("./config/dealer.config");
const Inventory = require("./config/Inventory.config");
const InventoryRoute = require("./routes/inventory.route");
const SalesRoute = require("./routes/sales.route");
const PriceRoute = require("./routes/price.route");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"))
app.use("/inventory", InventoryRoute);
app.use("/sales", SalesRoute);
app.use("/price", PriceRoute);

app.get("/", (req, res) => {
  res.render("landingPage");
});

app.get("/payement",(req,res)=>{
  res.render("payement");
})

app.get("/dashboard",(req,res)=>{
  res.render("dashboard");
});

app.get("/order",(req,res)=>{
  res.render("order");
})

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// app.post("/register", async (req, res) => {
//     const data = {
//         name: req.body.name,
//         email: req.body.email,
//         phone: req.body.phone,
//         location: req.body.location,
//         username: req.body.username,
//         password: req.body.password
//     };

//     const existingUser = await dealer.findOne({
//         $or: [
//             { email: data.email },
//             { username: data.username }
//         ]
//     });

//     if (existingUser) {
//         if (existingUser.email === data.email) {
//             return res.status(400).send("Email already in use");
//         }
//         if (existingUser.username === data.username) {
//             return res.status(400).send("Username already in use");
//         }
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(data.password, saltRounds);
//     data.password = hashedPassword;

//     try {
//         const userdata = await dealer.create(data);
//         console.log(userdata);
//         res.redirect("/login");
//     } catch (error) {
//         console.error("Error creating user:", error);
//         res.status(500).send("Error registering user.");
//     }
// });


// // Login route
// app.post("/login", async (req, res) => {
//   try {
//     const check = await dealer.findOne({ username: req.body.username });
//     if (!check) {
//       return res.send("No User Found");
//     }
//     const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);

//     if (isPasswordMatch) {
//       res.render("dashboard", { user: check });
//     } else {
//       res.send("Incorrect Password");
//     }
//   } catch (error) {
//     res.send("Invalid Details");
//   }
// });

app.get('/logout', (req, res) => {
  res.render("login");
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
