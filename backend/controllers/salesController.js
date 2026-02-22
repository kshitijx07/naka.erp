const Sales = require('../models/Sales');

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Accountant/Admin)
const getSales = async (req, res) => {
    try {
        const sales = await Sales.find().sort({ date: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private (Accountant/Admin)
const createSale = async (req, res) => {
    const {
        customerName,
        clothType,
        metersSold,
        ratePerMeter,
        paymentStatus,
        invoiceNumber,
        date,
    } = req.body;

    const totalAmount = metersSold * ratePerMeter;

    try {
        const sale = new Sales({
            customerName,
            clothType,
            metersSold,
            ratePerMeter,
            totalAmount,
            paymentStatus: paymentStatus || 'Pending',
            invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
            date: date || Date.now(),
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update sale
// @route   PUT /api/sales/:id
// @access  Private (Accountant/Admin)
const updateSale = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        const {
            customerName,
            clothType,
            metersSold,
            ratePerMeter,
            paymentStatus,
            date
        } = req.body;

        sale.customerName = customerName || sale.customerName;
        sale.clothType = clothType || sale.clothType;
        sale.metersSold = metersSold !== undefined ? Number(metersSold) : sale.metersSold;
        sale.ratePerMeter = ratePerMeter !== undefined ? Number(ratePerMeter) : sale.ratePerMeter;
        sale.paymentStatus = paymentStatus || sale.paymentStatus;
        sale.date = date || sale.date;

        // Recalculate total if needed
        sale.totalAmount = sale.metersSold * sale.ratePerMeter;

        const updatedSale = await sale.save();
        res.json(updatedSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete sale
// @route   DELETE /api/sales/:id
// @access  Private (Accountant/Admin)
const deleteSale = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id);

        if (!sale) {
            return res.status(404).json({ message: 'Sale not found' });
        }

        await sale.deleteOne();
        res.json({ message: 'Sale removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSales, createSale, updateSale, deleteSale };
