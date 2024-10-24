const Order = require("../config/order.config");
const Price = require("../config/price.config");
const Inventory = require("../config/Inventory.config");

const showOrderForm = async (req, res) => {
    res.render("order");
};

const displayOrder = async (req, res) => {
    try {
        // Fetch all orders from the database
        const orders = await Order.find();

        // Render the orders view and pass the orders data
        res.json({ orders });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
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
        const costPrice = priceEntry.costPrice;
        const totalPrice = costPrice * parseInt(quantity);

        // Create a new order instance
        const newOrder = new Order({
            name,
            model,
            costPrice,
            totalPrice, // Use `costPrice` to match the schema
            quantity,
            color,
            // status and createdAt will use default values
        });

        // Save the order to the database
        await newOrder.save();

        // Redirect to a confirmation page or orders list
        res.send("Order Placed Sucessfull ho gayi Mamu !") // Adjust the route as needed
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).send('Server Error');
    }
};

const updateOrderStatusToConfirmed = async (req, res) => {
    try {
        const { orderId } = req.params; // Get order ID from request parameters

        // Find the order by ID and update its status to 'confirmed'
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'confirmed' }, // Update the status to confirmed
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found.');
        }

        res.json({ message: 'Order status updated to confirmed successfully.', order: updatedOrder });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Server Error');
    }
};

const updateOrderStatusToDelivered = async (req, res) => {
    try {
        const { orderId } = req.params; // Get order ID from request parameters

        // Find the order by ID and update its status to 'delivered'
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status: 'delivered' }, // Update the status to delivered
            { new: true } // Return the updated document
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found.');
        }

        // Destructure necessary fields from the updated order
        const { name, model, color, quantity } = updatedOrder;

        // Find the price entry for the order
        const priceEntry = await Price.findOne({ name, model, color });

        if (!priceEntry) {
            return res.status(404).send('Price not found for the selected configuration.');
        }

        const costPrice = priceEntry.costPrice; // Extract the costPrice from the price entry

        // Check the inventory to see if the item already exists
        const existingInventoryItem = await Inventory.findOne({ name, model, color });

        if (existingInventoryItem) {
            // If the item exists, update the quantity
            existingInventoryItem.quantity += quantity; // Increment the quantity
            await existingInventoryItem.save(); // Save the updated item
        } else {
            // If the item does not exist, create a new inventory entry
            const newInventoryItem = new Inventory({
                name,
                model,
                color,
                quantity, // Set the initial quantity to the order quantity
                costPrice, // Add the cost price to the inventory item
                // Add other necessary fields if needed
            });

            await newInventoryItem.save(); // Save the new item to the inventory
        }

        res.json({ message: 'Order status updated to delivered and added to inventory.', order: updatedOrder });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).send('Server Error');
    }
};

module.exports = { showOrderForm, displayOrder, makeOrder, updateOrderStatusToConfirmed, updateOrderStatusToDelivered };
