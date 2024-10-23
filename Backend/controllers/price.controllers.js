const Price = require("../config/price.config");

const getPrice = async(req,res) =>{
    const { name , model , color } = req.body;
    try {
        const item = await Price.find({});
        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const addPrice = async(req,res) => {
    try {
        const price = await Price.create(req.body);
        res.status(200).send("Car Added");
    } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
    }
};

const updatePrice = async (req, res) => {
    const { name, model, color, costPrice } = req.body; // Get name, model, color, and newPrice from the request body
    try {
        // Find the item by name, model, and color, and update its costPrice
        const updatedItem = await Price.findOneAndUpdate(
            { name, model, color }, // Find item by name, model, and color
            { costPrice: costPrice }, // Update the costPrice
            { new: true, runValidators: true } // Return the updated document and run validations
        );

        // Check if the item was found and updated
        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Respond with success and the updated item
        res.status(200).json({ message: "Price updated successfully", item: updatedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};



module.exports = {getPrice,addPrice,updatePrice};