const Order = require("../config/order.config");
const Price = require("../config/price.config");

const showOrderForm = async (req, res) => {
    res.render("order");
};

const makeOrder = async (req, res) => {
    try {
        const { name, model, quantity, color } = req.body;

        // Validate required fields
        if (!name || !model || !quantity || !color) {
            return res.status(400).send('All fields are required.');
        }

        // Find the price from the Price collection based on name, model, and color
        const priceEntry = await Price.findOne({ name, model, color });

        if (!priceEntry) {
            return res.status(404).send('Price not found for the selected configuration.');
        }

        // Compute total cost price
        const unitPrice = priceEntry.costPrice;
        const costPrice = unitPrice * parseInt(quantity);

        // Create a new order instance
        const newOrder = new Order({
            name,
            model,
            costPrice, // Use `costPrice` to match the schema
            quantity,
            color,
            // status and createdAt will use default values
        });

        // Save the order to the database
        await newOrder.save();

        // Redirect to a confirmation page or orders list
        res.redirect('/order'); // Adjust the route as needed
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = { showOrderForm, makeOrder };
