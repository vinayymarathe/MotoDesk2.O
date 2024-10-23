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
        // Fetch all sales records from the database
        const salesRecords = await Sales.find();

        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        const reportPath = path.join(reportsDir, 'sales_report.pdf');

        // Pipe the PDF into a file
        doc.pipe(fs.createWriteStream(reportPath));

        // Add title
        doc.fontSize(20).text('Sales Report', { align: 'center' });
        doc.moveDown(1); // Add space after the title

        // Set up column widths and x positions
        const columnWidths = [70, 80, 80, 60, 70, 80, 80, 70];
        const columnXPositions = [50, 120, 200, 280, 360, 440, 520, 600];
        const columns = ['Date', 'Name', 'Model', 'Color', 'Quantity', 'Cost Price', 'Sell Price', 'Profit'];

        // Add a table header
        doc.fontSize(12).fillColor('black');
        columns.forEach((col, index) => {
            doc.text(col, columnXPositions[index], doc.y, { width: columnWidths[index], align: "center" });
        });
        doc.moveDown(0.5);

        // Draw a line after the header
        doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(650, doc.y).stroke();
        doc.moveDown(0.5);

        // Add sales records to the PDF
        salesRecords.forEach(sale => {
            const saleDate = sale.date ? sale.date.toISOString().split('T')[0] : 'N/A';
            const data = [
                saleDate,
                sale.name,
                sale.model,
                sale.color,
                sale.quantity.toString(),
                sale.costPrice.toFixed(2),
                sale.sellPrice.toFixed(2),
                sale.profit.toFixed(2)
            ];

            data.forEach((item, index) => {
                doc.text(item, columnXPositions[index], doc.y, { width: columnWidths[index], align: "center" });
            });

            doc.moveDown(0.5); // Add space after each record
            doc.lineWidth(0.5).moveTo(50, doc.y).lineTo(650, doc.y).stroke(); // Draw line between rows
            doc.moveDown(0.5);
        });

        // Finalize the PDF and end the stream
        doc.end();

        // Notify the user that the report is ready
        res.status(200).send(`Report generated successfully! You can download it from <a href="/reports/sales_report.pdf">this link</a>`);
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
