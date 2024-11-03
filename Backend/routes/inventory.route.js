const express = require("express");
const Inventory = require("../config/Inventory.config");
const { 
    getInv, 
    getInvByID, 
    addInv, 
    getcat,
    getInvByUsername
} = require("../controllers/inventory.controller");
const router = express.Router();

router.get("/",getInv); // Check if user is registered

router.get("/:id", getInvByID); // Ensure user is registered

router.post("/add", addInv); // Ensure user is registered

router.get("/user/:username", getInvByUsername);


module.exports = router;
