const RawMaterial = require('../models/RawMaterial');
const StockLog = require('../models/StockLog');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private (Manager/Admin)
const getMaterials = async (req, res) => {
    try {
        const materials = await RawMaterial.find().sort({ updatedAt: -1 });
        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new material
// @route   POST /api/materials
// @access  Private (Manager/Admin)
const createMaterial = async (req, res) => {
    const { materialName, category, unit, pricePerUnit, lowStockThreshold, initialStock } = req.body;
    try {
        const exists = await RawMaterial.findOne({ materialName });
        if (exists) return res.status(400).json({ message: 'Material already exists' });

        const material = new RawMaterial({
            materialName,
            category: category || 'General',
            unit: unit || 'kg',
            pricePerUnit: Number(pricePerUnit) || 0,
            lowStockThreshold: Number(lowStockThreshold) || 10,
            remainingStock: Number(initialStock) || 0,
            receivedQuantity: Number(initialStock) || 0,
        });

        const createdMaterial = await material.save();

        // Log initial stock
        if (Number(initialStock) > 0) {
            await StockLog.create({
                materialId: createdMaterial._id,
                type: 'Received',
                quantity: Number(initialStock),
                reason: 'Initial Stock',
            });
        }

        res.status(201).json(createdMaterial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update material details
// @route   PUT /api/materials/:id
// @access  Private (Manager/Admin)
const updateMaterial = async (req, res) => {
    try {
        const material = await RawMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        material.materialName = req.body.materialName || material.materialName;
        material.category = req.body.category || material.category;
        material.unit = req.body.unit || material.unit;
        material.pricePerUnit = req.body.pricePerUnit !== undefined ? Number(req.body.pricePerUnit) : material.pricePerUnit;
        material.lowStockThreshold = req.body.lowStockThreshold !== undefined ? Number(req.body.lowStockThreshold) : material.lowStockThreshold;

        const updatedMaterial = await material.save();
        res.json(updatedMaterial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private (Admin)
const deleteMaterial = async (req, res) => {
    try {
        const material = await RawMaterial.findById(req.params.id);
        if (material) {
            await material.remove();
            // Optionally remove logs: await StockLog.deleteMany({ materialId: req.params.id });
            res.json({ message: 'Material removed' });
        } else {
            res.status(404).json({ message: 'Material not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update stock (Receive/Issue)
// @route   POST /api/materials/update
// @access  Private (Manager/Admin)
const updateStock = async (req, res) => {
    const { id, quantity, type, reason } = req.body; // type: 'add' (Received) or 'consume' (Issued)

    try {
        const material = await RawMaterial.findById(id);
        if (!material) return res.status(404).json({ message: 'Material not found' });

        const qty = Number(quantity);
        if (qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

        if (type === 'add') {
            material.receivedQuantity += qty;
            material.remainingStock += qty;

            await StockLog.create({
                materialId: material._id,
                type: 'Received',
                quantity: qty,
                reason: reason || 'Stock Update',
            });

        } else if (type === 'consume' || type === 'issue') {
            if (material.remainingStock < qty) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            material.issuedQuantity += qty;
            material.remainingStock -= qty;

            await StockLog.create({
                materialId: material._id,
                type: 'Issued',
                quantity: qty,
                reason: reason || 'Stock Usage',
            });
        }

        const updatedMaterial = await material.save();
        res.json(updatedMaterial);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get stock history
// @route   GET /api/materials/:id/history
// @access  Private
const getStockHistory = async (req, res) => {
    try {
        const logs = await StockLog.find({ materialId: req.params.id }).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMaterials, createMaterial, updateMaterial, deleteMaterial, updateStock, getStockHistory };
