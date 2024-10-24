const Sales = require("../config/sales.config");
const Inventory = require("../config/Inventory.config");
const PDFDocument = require("pdfkit-table");
const fs = require("fs");
const path = require("path");
require('pdfkit-table');

const genReports = async (req, res) => {
    try {
        // Fetch all sales from the database
        const sales = await Sales.find();

        // Create a new PDF document
        const doc = new PDFDocument();

        // Set the response headers for the PDF
        res.setHeader("Content-disposition", "attachment; filename=sales_report.pdf");
        res.setHeader("Content-type", "application/pdf");

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add title to the PDF
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();

        // Prepare table data
        const tableData = {
            headers: ['Name', 'Model', 'Color', 'Quantity', 'Cost Price', 'Sell Price', 'Profit','Date'],
            rows: sales.map(sale => [
                sale.name,
                sale.model,
                sale.color,
                sale.quantity.toString(),
                sale.costPrice.toFixed(2),
                sale.sellPrice.toFixed(2),
                sale.profit.toFixed(2),
                sale.date,
            ])
        };

        // Add table to the PDF
        doc.table(tableData, {
            prepareHeader: () => doc.fontSize(10).font('Helvetica-Bold'),
            prepareRow: (row, i) => doc.font('Helvetica').fontSize(8)
        });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).send("An error occurred while generating the report.");
    }
};


const show = (req, res) => {
    res.render("sales");
};

const displaySales = async (req, res) => {
    try {
        // Fetch all orders from the database
        const sales = await Sales.find();

        // Render the orders view and pass the orders data
        res.json({ sales });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }
};

const makeSale = async (req, res) => {
    const { name, color, model, quantity, sellPrice } = req.body;

    // Validate incoming data
    if (!name || !color || !model || !quantity || !sellPrice) {
        return res.status(400).send("All fields are required.");
    }
    if (quantity <= 0 || sellPrice <= 0) {
        return res.status(400).send("Quantity and selling price must be greater than zero.");
    }

    try {
        // Find the item in inventory
        const item = await Inventory.findOne({ name, color, model });

        if (!item) {
            return res.status(404).send("No such item found or item out of stock.");
        }

        if (item.quantity < quantity) {
            return res.status(404).send("Not enough stock.");
        }

        // Update inventory and calculate profit
        item.quantity -= quantity;
        const totalCost = item.costPrice * quantity;
        const totalSalePrice = sellPrice * quantity;
        const profit = totalSalePrice - totalCost;

        await item.save();

        // Create a new sale record
        const sale = new Sales({
            name,
            model,
            costPrice: item.costPrice,
            sellPrice,
            quantity,
            color,
            profit,
        });

        await sale.save();

        // Return success message with the profit
        return res.status(200).send(`Sale successful! Estimated profit: ${profit}`);

    } catch (error) {
        console.error("Error while processing the sale:", error);
        return res.status(500).send("An error occurred while processing the sale.");
    }
};

module.exports = { show, makeSale, genReports ,displaySales};
