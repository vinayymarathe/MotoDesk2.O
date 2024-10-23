const Customer = require('../config/customer.config');

// Add customer
const addCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, car, model, color, status } = req.body;

        if(!name||!phone){
            return res.status(400).send("Name and Phone is Required.");
        }
        const newCustomer = new Customer({ name, email, phone, address, car, model, color, status });
        await newCustomer.save();
        res.redirect('/customer');
    } catch (err) {
        console.error("Error adding the Customer");
        res.status(500).send('Server Error');
    }
};

// Get customer details
const getCustomerDetails = async (req, res) => {
    const { name, phone } = req.query;
    
    try {
        const customer = await Customer.findOne({ name, phone });
        
        if (!customer) {
            return res.status(404).send('Customer not found');
        }
        
        res.json(customer);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { addCustomer, getCustomerDetails};