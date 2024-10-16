const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const dealer = require("./config/dealer.config");
const Inventory = require("./config/Inventory.config");
const InventoryRoute = require("./routes/inventory.route");

const app = express();
const PORT = 3000;


app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.use("/Inv", InventoryRoute);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/invent", (req, res) => {
  res.render("addInventory");
});


// Register route
app.post("/register", async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        username: req.body.username,
        password: req.body.password
    };

    // Check if user already exists
    const existingUser = await dealer.findOne({
        $or: [
            { email: data.email },
            { username: data.username }
        ]
    });

    if (existingUser) {
        if (existingUser.email === data.email) {
            return res.status(400).send("Email already in use");
        }
        if (existingUser.username === data.username) {
            return res.status(400).send("Username already in use");
        }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;

    // Attempt to create the user
    try {
        const userdata = await dealer.create(data); // Use create instead of insertMany for a single document
        console.log(userdata);
        res.redirect("/login"); // Redirect to login after registration
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error registering user.");
    }
});


// Login route
app.post("/login", async (req, res) => {
  try {
    const check = await dealer.findOne({ username: req.body.username });
    if (!check) {
      return res.send("No User Found");
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);

    if (isPasswordMatch) {
      res.render("dashboard", { user: check }); // Send user data to the dashboard
    } else {
      res.send("Incorrect Password");
    }
  } catch (error) {
    res.send("Invalid Details");
  }
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
