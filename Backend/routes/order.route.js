const express = require("express");
const { showOrderForm, makeOrder, updateOrderStatusToConfirmed, updateOrderStatusToDelivered } = require("../controllers/order.controller");
const router = express.Router();

router.get("/",showOrderForm);
router.post("/add",makeOrder);
router.post("/order/update/confirmed/:orderId",updateOrderStatusToConfirmed);
router.post("/order/update/delivered/:orderId",updateOrderStatusToDelivered);
module.exports = router;