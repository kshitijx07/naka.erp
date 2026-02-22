const Maintenance = require('../models/Maintenance');
const Machine = require('../models/Machine');
const RawMaterial = require('../models/RawMaterial');
const StockLog = require('../models/StockLog');

// --- MACHINES ---

// @desc    Get all machines
// @route   GET /api/maintenance/machines
const getMachines = async (req, res) => {
    try {
        const machines = await Machine.find().sort({ createdAt: -1 });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a machine
// @route   POST /api/maintenance/machines
const createMachine = async (req, res) => {
    const { name, type, location, installDate, modelNumber } = req.body;
    try {
        const machine = new Machine({ name, type, location, installDate, modelNumber });
        const createdMachine = await machine.save();
        res.status(201).json(createdMachine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update machine
// @route   PUT /api/maintenance/machines/:id
const updateMachine = async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        Object.assign(machine, req.body);
        const updatedMachine = await machine.save();
        res.json(updatedMachine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete machine
// @route   DELETE /api/maintenance/machines/:id
const deleteMachine = async (req, res) => {
    try {
        const machine = await Machine.findById(req.params.id);
        if (machine) {
            await machine.remove();
            res.json({ message: 'Machine removed' });
        } else {
            res.status(404).json({ message: 'Machine not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- WORK ORDERS (MAINTENANCE) ---

// @desc    Get all work orders
// @route   GET /api/maintenance
const getWorkOrders = async (req, res) => {
    try {
        const orders = await Maintenance.find()
            .populate('machineId', 'name type location')
            .populate('technician', 'name')
            .populate('reportedBy', 'name')
            .populate('partsUsed.materialId', 'materialName unit pricePerUnit')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create work order
// @route   POST /api/maintenance
const createWorkOrder = async (req, res) => {
    const { machineId, description, type, priority, technician } = req.body;
    try {
        const machine = await Machine.findById(machineId);
        if (!machine) return res.status(404).json({ message: 'Machine not found' });

        const workOrder = new Maintenance({
            machineId,
            description,
            type,
            priority,
            technician,
            reportedBy: req.user._id,
            status: 'Pending',
        });

        // Update Machine Status
        if (type === 'Breakdown') {
            machine.status = 'Breakdown';
            await machine.save();
        } else if (type === 'Routine' || type === 'Repair') {
            // Optional: Set to 'Under Maintenance' if immediate
        }

        const createdOrder = await workOrder.save();
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update work order (Status, Parts, Technician)
// @route   PUT /api/maintenance/:id
const updateWorkOrder = async (req, res) => {
    const { status, technician, partsUsed, downtimeMinutes, cost } = req.body;
    try {
        const order = await Maintenance.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (status) order.status = status;
        if (technician) order.technician = technician;
        if (downtimeMinutes !== undefined) order.downtimeMinutes = Number(downtimeMinutes);
        if (cost !== undefined) order.cost = Number(cost);

        // Handle Parts Usage & Inventory Deduction
        if (partsUsed && Array.isArray(partsUsed)) {
            // Revert previous parts (complex, skipping for simplicity in this step)
            // Deduct new parts
            for (const part of partsUsed) {
                const material = await RawMaterial.findById(part.materialId);
                if (material) {
                    if (material.remainingStock >= part.quantity) {
                        material.remainingStock -= part.quantity;
                        material.issuedQuantity += part.quantity;
                        await material.save();

                        await StockLog.create({
                            materialId: material._id,
                            type: 'Issued',
                            quantity: part.quantity,
                            reason: `Work Order #${order._id}`,
                        });
                    }
                }
            }
            order.partsUsed = partsUsed;
        }

        if (status === 'In Progress' && !order.startDate) {
            order.startDate = Date.now();
        }

        if (status === 'Completed') {
            order.completionDate = Date.now();

            // Update Machine Status to Operational
            const machine = await Machine.findById(order.machineId);
            if (machine) {
                machine.status = 'Operational';
                machine.lastMaintenanceDate = Date.now();
                await machine.save();
            }
        }

        const updatedOrder = await order.save();
        const populatedOrder = await Maintenance.findById(updatedOrder._id)
            .populate('machineId', 'name')
            .populate('technician', 'name')
            .populate('partsUsed.materialId', 'materialName');

        res.json(populatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getMachines, createMachine, updateMachine, deleteMachine,
    getWorkOrders, createWorkOrder, updateWorkOrder
};
