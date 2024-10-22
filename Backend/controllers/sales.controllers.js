const Sales = require("../config/sales.config");
const Inventory = require("../config/Inventory.config");

const show = (req,res) => {
    res.render("sales");
};

const makeSale = async (req, res) => {
    const { name, color, model, quantity, sellPrice } = req.body;

    try {
        const item = await Inventory.findOne({ name, color, model });

        if (!item) {
            return res.status(404).send("No Such Item Found or Item out of Stock");
        } else {
            if (item.quantity < quantity) {
                return res.status(404).send("Not Enough Stock");
            } else {
                item.quantity -= quantity;

                const totalCost = item.costPrice * quantity;
                const totalSalePrice = sellPrice * quantity;
                const profit = totalSalePrice - totalCost;

                await item.save();

                const sale = new Sales({
                    itemName: name,
                    model,
                    costPrice: item.costPrice,
                    sellPrice,
                    quantity,
                    color,
                    profit,
                });

                await sale.save();


                return res.status(200).send(`Sale successful! Estimated profit: ${profit}`);

            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send(error);
    }
};


module.exports = {show,makeSale};