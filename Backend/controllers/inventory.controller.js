const Inventory = require("../config/Inventory.config");
const User = require("../config/dealer.config"); // Assuming you have a User model

const getInv = async (req, res) => {
    try {
        const { username } = req.params; // Expecting username as a query parameter
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const inv = await Inventory.find({ dealerId: user._id });
        res.status(200).json(inv);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getcat = async (req, res) => {
    try {
        const items = await Inventory.find({});
        res.render("Catlog", { items });
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

        // You may also want to ensure the inventory item belongs to the user
        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getInvByUsername = async (req, res) => {
    const { username } = req.body; // Get the username from the route parameters
    try {
        // Step 1: Find the user by their username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 2: Find all inventory items associated with this user
        const inventories = await Inventory.find({ dealer: user._id }).populate('dealer', 'username');
        
        // Step 3: Return the inventory items
        res.status(200).json(inventories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const addInv = async (req, res) => {
    const { username, name, model, costPrice, quantity, color } = req.body;

    try {
        // Step 1: Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 2: Create inventory with the user's ID
        const inventoryData = {
            dealer: user._id, // Use the user's ObjectId
            name,
            model,
            costPrice,
            quantity,
            color,
        };

        const inventory = await Inventory.create(inventoryData);
        res.status(200).json({ message: "Successfully added to your Inventory", inventory });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send("Car ID must be unique. This Car ID already exists.");
        } else {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
        }
    }
};

module.exports = { getInv, getInvByID, addInv,getInvByUsername, getcat };
