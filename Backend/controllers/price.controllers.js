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
        res.status(200).send("Successfully added to your Inventory");
    } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {getPrice,addPrice};