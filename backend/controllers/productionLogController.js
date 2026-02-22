const ProductionLog = require('../models/ProductionLog');

const getProductionLogs = async (req, res) => {
    try {
        const logs = await ProductionLog.find()
            .populate('workerId', 'name')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new production log
// @route   POST /api/production
// @access  Private
const addProductionLog = async (req, res) => {
    const { clothType, metersProduced, date, loomNumber, workerId, defects } = req.body;

    try {
        const log = await ProductionLog.create({
            clothType,
            metersProduced,
            date,
            loomNumber,
            workerId,
            defects: defects || 0
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update production log
// @route   PUT /api/production/:id
// @access  Private
const updateProductionLog = async (req, res) => {
    try {
        const log = await ProductionLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Production log not found' });
        }

        const updatedLog = await ProductionLog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete production log
// @route   DELETE /api/production/:id
// @access  Private
const deleteProductionLog = async (req, res) => {
    try {
        const log = await ProductionLog.findById(req.params.id);

        if (!log) {
            return res.status(404).json({ message: 'Production log not found' });
        }

        await log.deleteOne();
        res.json({ message: 'Production log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProductionLogs,
    addProductionLog,
    updateProductionLog,
    deleteProductionLog,
};
