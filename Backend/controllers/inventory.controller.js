const Inventory = require("../config/Inventory.config");

const getInv = async (req, res) => {
    try {
        const inv = await Inventory.find({});
        res.json(inv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getcat = async(req,res) => {
    try {
        const items = await Inventory.find({});
        res.render("Catlog",{items});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getInvByID = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({ message: "Inventory not found" });
        }
        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const addInv = async (req, res) => {
    try {
        const inventory = await Inventory.create(req.body);
        res.status(200).send("Successfully added to your Inventory");
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send("Car ID must be unique. This Car ID already exists." );
        } else {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }
};


const updateInv = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findByIdAndUpdate(id, req.body, { new: true });
        if (!inventory) {
            return res.status(404).json({ message: "Inventory not found" });
        }
        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const delInv = async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await Inventory.findByIdAndDelete(id);
        if (!inventory) {
            return res.status(404).json({ message: "Inventory not found" });
        }
        res.status(200).json({ message: "Inventory deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { getInv, getInvByID, addInv, updateInv, delInv, getcat };
