const Sales = require("../config/sales.config");
const Inventory = require("../config/Inventory.config");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const show = (req, res) => {
    res.render("sales");
};

const genReports = async (req, res) => {
    try {
        // Fetch all sales records from the database
        const salesRecords = await Sales.find();

        // Check if there are any records
        if (salesRecords.length === 0) {
            return res.status(404).send("No sales records found.");
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, "../reports/sales_report.pdf");

        // Pipe the PDF to a file
        doc.pipe(fs.createWriteStream(filePath));

        // Add a title
        doc.fontSize(25).text("Sales Report", { align: "center" });
        doc.moveDown();

        // Add column headers
        doc.fontSize(12).text("Name\tModel\tColor\tQuantity\tCost Price\tSell Price\tProfit", {
            align: "left"
        });
        doc.moveDown();

        // Add sales records
        salesRecords.forEach(sale => {
            doc.text(`${sale.name}\t${sale.model}\t${sale.color}\t${sale.quantity}\t${sale.costPrice}\t${sale.sellPrice}\t${sale.profit}`);
        });

        // Finalize the PDF and end the stream
        doc.end();

        // Send the PDF file as a response
        res.download(filePath, "sales_report.pdf", (err) => {
            if (err) {
                console.error("Error sending PDF:", err);
                res.status(500).send("Error generating report.");
            }

            // Optionally, delete the PDF file after sending
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).send("An error occurred while generating the report.");
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

module.exports = { show, makeSale , genReports};
