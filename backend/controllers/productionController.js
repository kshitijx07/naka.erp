const ProductionOrder = require('../models/ProductionOrder');
const RawMaterial = require('../models/RawMaterial');
const Machine = require('../models/Machine');

// @desc    Get all production orders
// @route   GET /api/production-orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await ProductionOrder.find()
            .populate('assignedMachine', 'name type')
            .populate('assignedWorker', 'name')
            .populate('materials.material', 'materialName unit')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new production order
// @route   POST /api/production-orders
// @access  Private
const createOrder = async (req, res) => {
    const {
        orderNumber,
        productName,
        targetQuantity,
        startDate,
        endDate,
        priority,
        assignedMachine,
        assignedWorker,
        materials,
        notes
    } = req.body;

    try {
        const orderExists = await ProductionOrder.findOne({ orderNumber });
        if (orderExists) {
            return res.status(400).json({ message: 'Order number already exists' });
        }

        const order = await ProductionOrder.create({
            orderNumber,
            productName,
            targetQuantity,
            startDate,
            endDate,
            priority,
            assignedMachine,
            assignedWorker,
            materials,
            notes
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update production order status & progress
// @route   PUT /api/production-orders/:id
// @access  Private
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { status, producedQuantity, consumeMaterials } = req.body;

    try {
        const order = await ProductionOrder.findById(id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Logic to update fields
        if (status) order.status = status;

        if (producedQuantity !== undefined) {
            const quantityDiff = producedQuantity - order.producedQuantity;
            order.producedQuantity = producedQuantity;

            // Auto-consume materials if flag is true and production increased
            if (consumeMaterials && quantityDiff > 0) {
                for (let mat of order.materials) {
                    const consumption = mat.quantityPerUnit * quantityDiff;
                    mat.totalConsumed += consumption;

                    // Deduct from Inventory
                    const rawMaterial = await RawMaterial.findById(mat.material);
                    if (rawMaterial) {
                        if (rawMaterial.remainingStock >= consumption) {
                            rawMaterial.remainingStock -= consumption;
                            rawMaterial.issuedQuantity += consumption;
                            await rawMaterial.save();
                        } else {
                            // Ideally, we might want to throw an error or warn, 
                            // but for now we'll allow negative stock or partial updates in a real app, 
                            // strictly here we just deduct what we can or go negative?
                            // Let's go negative to reflect reality that material WAS used even if system wasn't updated.
                            rawMaterial.remainingStock -= consumption; // Allow negative for traceability
                            rawMaterial.issuedQuantity += consumption;
                            await rawMaterial.save();
                        }
                    }
                }
            }
        }

        // Update other fields passed in body
        const otherFields = ['productName', 'targetQuantity', 'startDate', 'endDate', 'priority', 'assignedMachine', 'assignedWorker', 'notes'];
        otherFields.forEach(field => {
            if (req.body[field] !== undefined) {
                order[field] = req.body[field];
            }
        });


        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete production order
// @route   DELETE /api/production-orders/:id
// @access  Private
const deleteOrder = async (req, res) => {
    try {
        const order = await ProductionOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrders,
    createOrder,
    updateOrder,
    deleteOrder,
};
