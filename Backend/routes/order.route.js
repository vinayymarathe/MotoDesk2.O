const express = require("express");
const { showOrderForm, makeOrder } = require("../controllers/order.controller");
const router = express.Router();

router.get("/",showOrderForm);
router.post("/add",makeOrder);

module.exports = router;