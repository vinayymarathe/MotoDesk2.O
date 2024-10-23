const express = require("express");
const { getPrice, addPrice, updatePrice } = require("../controllers/price.controllers");
const router = express.Router();

router.get("/",getPrice);
router.post("/add",addPrice);
router.put("/update", updatePrice);

module.exports = router;