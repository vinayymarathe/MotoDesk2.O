const Inventory = require("../config/Inventory.config");

const getInv = (req,res) => {
    const Inv = Inventory.find({});
    res.status(200).json(Inv);
};

const getInvByID = async(req,res) => {
    const { id } = req.params;
    const inventory = await Inventory.findById(id);
    res.status(200).json(Inventory);
};

const addInv = async(req,res) => {
    const inventory = await Inventory.create(req.body);
    res.status(200).json(inventory);
};

const updateInv = async(req,res) => {
    const { id } = req.params;

    const inventory = await Inventory.findByIdAndUpdate(id, req.body);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    const updatedInventory = await Inventory.findById(id);
    res.status(200).json(updatedInventory);
};

const delInv = async(req,res) =>{
    const { id } = req.params;

    const inventory = await Inventory.findByIdAndDelete(id);

    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({ message: "Inventory deleted successfully" });
};

module.exports = {getInv,getInvByID,addInv,updateInv,delInv};