const express = require("express")
const bcrypt = require("bcrypt")
const path = require("path")
const collection = require("./config")

const app = express()
const PORT = 3000;

app.set('view engine','ejs');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.use(express.static("public"));

app.get("/",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",async(req,res)=>{
    const data = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        username: req.body.username,
        password: req.body.password
    }

    const existingUser = await collection.findOne({
        $or: [
          { email: data.email },
          { username: data.username }
        ]
    });

    if (existingUser) {
        if (existingUser.email === data.email) {
          res.status(400).send('Email already in use');
        }
        if (existingUser.username === data.username) {
          res.status(400).send('Username already in use');
        }
    }
    const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password , saltRounds);

            data.password = hashedPassword;

            const userdata = await collection.insertMany(data);
            console.log(userdata);

});

app.post("/login",async(req,res)=>{
    try {
        const check = await collection.findOne({username: req.body.username});
        if(!check){
            res.send("No User Found");
        }
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        
        if(isPasswordMatch){
            res.render("dashboard");
        }
        else{
            res.send("Incorrect Password");
        }
    } catch (error) {
        res.send("Invalid Details");
    }
});

app.listen(PORT,()=>{
    console.log(`Server Running on port ${PORT}`);
});