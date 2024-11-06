const express = require("express");
const { show, makeSale, genReports, displaySales } = require("../controllers/sales.controllers");
const router = express.Router();

router.get("/",show);
router.post("/add",makeSale);
router.get("/report",genReports);
router.get("/getSales",displaySales);

module.exports = router;