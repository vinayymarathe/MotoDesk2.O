const express = require("express");
const { getPrice, addPrice } = require("../controllers/price.controllers");
const router = express.Router();

router.get("/",getPrice);
router.post("/add",addPrice);

module.exports = router;