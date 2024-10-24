const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const dealer = require("./config/dealer.config");
const InventoryRoute = require("./routes/inventory.route");
const SalesRoute = require("./routes/sales.route");
const PriceRoute = require("./routes/price.route");
const OrderRoute = require("./routes/order.route");
const customerRoutes = require('./routes/customer.route');
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bodyParser = require('body-parser');
const cors = require("cors");
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = 3000;
const secretKey = process.env.SECRET_KEY || 'nex1234'; // Default secret key if not in .env

app.set("view engine", "ejs");

// Google OAuth Setup
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await dealer.findOne({ email: profile.emails[0].value });

    if (user) {
      // User exists, proceed with login
      return done(null, user);
    } else {
      return done(null, false, { message: "No user found" });
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await dealer.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(session({
  secret: 'nex123',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Routes
app.use("/inventory", InventoryRoute);
app.use("/sales", SalesRoute);
app.use("/order", OrderRoute);
app.use("/price", PriceRoute);
app.use("/customer", customerRoutes);

// Middleware for verifying JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).send('A token is required for authentication');
  }
  
  const token = authHeader.split(' ')[1]; // Split 'Bearer <token>' and extract token
  
  console.log(token);
  if (!token) {
    return res.status(403).send('Invalid Token Format');
  }

  try {
    const decoded = jwt.verify(token, secretKey); // Verify the token
    req.user = decoded; // Attach decoded token data to req.user
    next(); // Proceed to the next middleware
  } catch (err) {
    return res.status(401).send('Invalid Token or Token Expired');
  }
};


// Landing Page
app.get("/", (req, res) => {
  res.render("landingPage");
});

// Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

// Registration Page
app.get("/register", (req, res) => {
  res.render("register");
});

// Google OAuth Authentication Routes
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);
// Dashboard (Protected Route)
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    return res.render("dashboard", { user: req.user });
  }

  if (req.headers['authorization']) {
    return verifyToken(req, res, () => {
      res.render("dashboard", { user: req.user });
    });
  }

  return res.redirect("/login"); // If neither JWT nor OAuth, redirect to login
});


// JWT Login Route (Username + Password)
app.post("/login", async (req, res) => {
  try {
    const user = await dealer.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).send("No User Found");
    }

    const isPasswordMatch = req.body.password === user.password; // Use bcrypt if hashing is implemented
    if (!isPasswordMatch) {
      return res.status(401).send("Incorrect Password");
    }

    const token = jwt.sign({ userId: user._id, username: user.username, name: user.name }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).send("Login Failed");
  }
});

// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, location, username, password } = req.body;
    const existingUser = await dealer.findOne({
      $or: [{ email: email }, { username: username }]
    });

    if (existingUser) {
      if (existingUser.email === email) return res.status(400).send("Email already in use");
      if (existingUser.username === username) return res.status(400).send("Username already in use");
    }

    const newUser = new dealer({
      name, email, phone, location, username, password
    });

    await newUser.save();
    res.redirect("/login");
  } catch (error) {
    res.status(500).send("Error registering user.");
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.log(err);
    }
    res.redirect("/login");
  });
});

app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
