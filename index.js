const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const dealer = require("./config/dealer.config");
const Inventory = require("./config/Inventory.config");
const InventoryRoute = require("./routes/inventory.route");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();
const PORT = 3000;

app.use(
  session({
    secret: "123456789",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: '499154116072-6fnr6n35bkuap4ilathhq6gcdsimouf3.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        const existingUser = await dealer.findOne({ email: profile.emails[0].value });
        
        if (existingUser) {
            // If user exists, return the user
            return done(null, existingUser);
        }

        // If user doesn't exist, create a new one
        const newUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            phone: '', // Assign default or prompt the user to provide this later
            location: '', // Assign default or prompt the user to provide this later
            username: profile.id, // Use Google ID or generate a username
            password: '' // No password for Google login
        };

        const createdUser = await dealer.create(newUser);
        return done(null, createdUser);
    } catch (error) {
        return done(error);
    }
}));


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

// Handle Google authentication
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", { 
    failureRedirect: "/login" 
  }), (req, res) => {
    // Successful authentication, redirect to the dashboard or home page
    res.render("dashboard", { user: req.user });
  }
);

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
