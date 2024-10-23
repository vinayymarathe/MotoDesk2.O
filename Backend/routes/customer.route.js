const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controllers');

// Add Customer
router.post('/addCustomer',customerController.addCustomer);

// Get Customer Details
router.get('/getCustomerDetails', customerController.getCustomerDetails);

module.exports = router;