const Customer = require('../config/customer.config');

// Add customer
const addCust = async (req, res) => {
    try {
        const { name, email, phone, address, car, model, color, status, rating, description } = req.body;

        // Create a new customer instance
        const newCustomer = new Customer({
            name,
            email,
            phone,
            address,
            car,
            model,
            color,
            status,
            rating,
            description
        });

        // Save the customer to the database
        await newCustomer.save();

        // Send a response
        res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
    } catch (error) {
        console.error("Error adding customer:", error);
        res.status(500).json({ message: "Error adding customer", error: error.message });
    }
};

// Get customer details
const getReviews = async (req, res) => {
    try {
        // Retrieve all customers with their reviews and ratings
        const customers = await Customer.find({}, 'name email rating description'); // Select specific fields

        // Check if any customers are found
        if (!customers.length) {
            return res.status(404).json({ message: "No customers found" });
        }

        // Send the retrieved customer details as response
        res.status(200).json({ customers });
    } catch (error) {
        console.error("Error retrieving reviews:", error);
        res.status(500).json({ message: "Error retrieving reviews", error: error.message });
    }
};

module.exports = { addCust, getReviews };
