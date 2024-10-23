const express = require("express");
const { show, makeSale, genReports } = require("../controllers/sales.controllers");
const router = express.Router();

router.get("/",show);
router.post("/add",makeSale);
router.get("/report",genReports);

module.exports = router;