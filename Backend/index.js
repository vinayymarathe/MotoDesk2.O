const express = require("express");
 const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const dealer = require("./config/dealer.config");
const Inventory = require("./config/Inventory.config");
const InventoryRoute = require("./routes/inventory.route");
const SalesRoute = require("./routes/sales.route");
const PriceRoute = require("./routes/price.route");
const OrderRoute = require("./routes/order.route");
const cors = require("cors");

const app = express();
const PORT = 3000;
const secretKey = 'nex1234'; 

app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"))
app.use("/inventory", InventoryRoute);
app.use("/sales", SalesRoute);
app.use("/order",OrderRoute);
app.use("/price", PriceRoute);

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach decoded token data (e.g., userId) to req.user
    next();
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
};
app.get("/", (req, res) => {
  res.render("landingPage");
});

app.get("/payement",(req,res)=>{
  res.render("payement");
})

app.get("/dashboard", verifyToken, (req, res) => {
  // Now you can access req.user to get the decoded token data (e.g., userId)
  res.render("dashboard", { user: req.user });
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

app.post("/register", async (req, res) => {
  try {
      // Extract user input from the request body
      const { name, email, phone, location, username, password } = req.body;

      // Check if the user already exists (by email or username)
      const existingUser = await dealer.findOne({
          $or: [
              { email: email },
              { username: username }
          ]
      });

      if (existingUser) {
          if (existingUser.email === email) {
              return res.status(400).send("Email already in use");
          }
          if (existingUser.username === username) {
              return res.status(400).send("Username already in use");
          }
      }

      // If the user doesn't exist, create a new one
      const saltRounds = 10;  // bcrypt for password hashing
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = new dealer({
          name,
          email,
          phone,
          location,
          username,
          password: hashedPassword // store the hashed password
      });

      // Save the new user in the database
      await newUser.save();
      const express = require("express");
      const bcrypt = require("bcrypt");
      const jwt = require("jsonwebtoken");
      const path = require("path");
      const dealer = require("./config/dealer.config");
      const InventoryRoute = require("./routes/inventory.route");
      const SalesRoute = require("./routes/sales.route");
      const PriceRoute = require("./routes/price.route");
      const OrderRoute = require("./routes/order.route");
      const cors = require("cors");
      require('dotenv').config(); // Load environment variables
      
      const app = express();
      const PORT = 3000;
      const secretKey = process.env.SECRET_KEY; // Use environment variable for secret key
      
      app.set("view engine", "ejs");
      
      app.use(cors());
      app.use(express.json());
      app.use(express.urlencoded({ extended: false }));
      app.use(express.static("public"));
      
      app.use("/inventory", InventoryRoute);
      app.use("/sales", SalesRoute);
      app.use("/order", OrderRoute);
      app.use("/price", PriceRoute);
      
      // Middleware for verifying token
      const verifyToken = (req, res, next) => {
        const token = req.headers['authorization'];
      
        if (!token) {
          return res.status(403).json({ message: 'A token is required for authentication' });
        }
      
        try {
          const decoded = jwt.verify(token, secretKey);
          req.user = decoded; // Attach decoded token data to req.user
          next();
        } catch (err) {
          return res.status(401).json({ message: 'Invalid Token' });
        }
      };
      
      app.get("/", (req, res) => {
        res.render("landingPage");
      });
      
      app.get("/payment", (req, res) => {
        res.render("payment");
      });
      
      app.get("/dashboard", verifyToken, (req, res) => {
        res.render("dashboard", { user: req.user });
      });
      
      app.get("/order", (req, res) => {
        res.render("order");
      });
      
      app.get("/login", (req, res) => {
        res.render("login");
      });
      
      app.get("/register", (req, res) => {
        res.render("register");
      });
      
      app.post("/register", async (req, res) => {
        try {
            const { name, email, phone, location, username, password } = req.body;
      
            const existingUser = await dealer.findOne({
                $or: [
                    { email: email },
                    { username: username }
                ]
            });
      
            if (existingUser) {
                if (existingUser.email === email) {
                    return res.status(400).json({ message: "Email already in use" });
                }
                if (existingUser.username === username) {
                    return res.status(400).json({ message: "Username already in use" });
                }
            }
      
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
      
            const newUser = new dealer({
                name,
                email,
                phone,
                location,
                username,
                password: hashedPassword
            });
      
            await newUser.save();
            res.redirect("/login");
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).json({ message: "Error registering user." });
        }
      });
      
      app.post("/login", async (req, res) => {
        try {
          const user = await dealer.findOne({ username: req.body.username });
          if (!user) {
            return res.status(404).json({ message: "No User Found" });
          }
      
          const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
          if (!isPasswordMatch) {
            return res.status(401).json({ message: "Incorrect Password" });
          }
      
          const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '1h' });
          res.json({ message: 'Login successful', token });
      
        } catch (error) {
          console.error("Login error:", error);
          res.status(500).json({ message: "Login Failed" });
        }
      });
      
      app.get('/logout', (req, res) => {
        res.render("login");
      });
      
      app.listen(PORT, () => {
        console.log(`Server Running on port ${PORT}`);
      });
      
      // Redirect to the login page after successful registration
      res.redirect("/login");
  } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send("Error registering user.");
  }
});


app.post("/login", async (req, res) => {
  try {
    const user = await dealer.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).send("No User Found");
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).send("Incorrect Password");
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '1h' });

    // Send the token to the client
    res.json({ token });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send("Login Failed");
  }
});



app.get('/logout', (req, res) => {
  res.render("login");
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
