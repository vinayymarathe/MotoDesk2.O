const express = require("express");
const { show, makeSale } = require("../controllers/sales.controllers");
const router = express.Router();

router.get("/",show);

router.post("/add",makeSale);

module.exports = router;