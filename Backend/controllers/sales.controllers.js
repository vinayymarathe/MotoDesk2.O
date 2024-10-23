const Sales = require("../config/sales.config");
const Inventory = require("../config/Inventory.config");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

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

const genReports = async (req, res) => {
    try {
        // Fetch all sales from the database
        const sales = await Sales.find();

        // Create a new PDF document
        const doc = new PDFDocument();
        
        // Set the response headers
        res.setHeader("Content-disposition", "attachment; filename=sales_report.pdf");
        res.setHeader("Content-type", "application/pdf");

        // Pipe the PDF into the response
        doc.pipe(res);

        // Add title
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown();

        // Add column headers
        doc.fontSize(10);
        doc.text('Name', { continued: true }).text('  |  ', { continued: true });
        doc.text('Model', { continued: true }).text('  |  ', { continued: true });
        doc.text('Color', { continued: true }).text('  |  ', { continued: true });
        doc.text('Quantity', { continued: true }).text('  |  ', { continued: true });
        doc.text('Cost Price', { continued: true }).text('  |  ', { continued: true });
        doc.text('Sell Price', { continued: true }).text('  |  ', { continued: true });
        doc.text('Profit', { continued: true });
        doc.moveDown();

        // Draw a line
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Add sales data to the PDF
        sales.forEach(sale => {
            doc.text(sale.name, { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.model, { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.color, { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.quantity.toString(), { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.costPrice.toFixed(2), { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.sellPrice.toFixed(2), { continued: true });
            doc.text('  |  ', { continued: true });
            doc.text(sale.profit.toFixed(2));
            doc.moveDown();
        });

        // Finalize the PDF and end the stream
        doc.end();
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).send("An error occurred while generating the report.");
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
