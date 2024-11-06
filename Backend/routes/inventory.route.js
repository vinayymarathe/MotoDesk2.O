const express = require("express");
const Inventory = require("../config/Inventory.config");
const { getInv, getInvByID, updateInv, delInv, addInv, getcat, getprice } = require("../controllers/inventory.controller");
const router = express.Router();

router.get("/",getInv);

router.get("/get",getcat);

router.get("/:id",getInvByID);

router.patch("/:id",updateInv);

router.delete("/:id",delInv);

router.post("/add",addInv);
  

module.exports = router;
