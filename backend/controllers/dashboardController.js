const Sales = require('../models/Sales');
const ProductionLog = require('../models/ProductionLog'); // Corrected model
const ProductionOrder = require('../models/ProductionOrder');
const RawMaterial = require('../models/RawMaterial');
const Maintenance = require('../models/Maintenance');
const User = require('../models/User');
const Machine = require('../models/Machine'); // Added Machine model

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        // Run independent queries in parallel for performance
        const [
            sales,
            productionLogs,
            productionOrders,
            materials,
            maintenance,
            users,
            machines
        ] = await Promise.all([
            Sales.find().sort({ createdAt: -1 }),
            ProductionLog.find(),
            ProductionOrder.find(),
            RawMaterial.find(),
            Maintenance.find().populate('machineId', 'name'),
            User.find(),
            Machine.find()
        ]);

        // 1. Total Revenue
        const totalRevenue = sales.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

        // 2. Production Metrics & Efficiency
        // Real efficiency calculation: (Produced / Target) * 100 for completed orders
        const totalProduction = productionLogs.reduce((acc, curr) => acc + (curr.metersProduced || 0), 0);
        const activeProductionOrders = productionOrders.filter(o => o.status === 'In Progress').length;

        const completedOrders = productionOrders.filter(o => o.status === 'Completed' || o.producedQuantity > 0);
        let efficiencyRate = 0; // Default to 0, no dummy data
        if (completedOrders.length > 0) {
            const totalTarget = completedOrders.reduce((acc, curr) => acc + (curr.targetQuantity || 0), 0);
            const totalProduced = completedOrders.reduce((acc, curr) => acc + (curr.producedQuantity || 0), 0);
            if (totalTarget > 0) {
                efficiencyRate = Math.round((totalProduced / totalTarget) * 100);
            }
        }

        // 3. Inventory Alerts
        const lowStockItems = materials.filter(m => m.remainingStock <= m.lowStockThreshold);
        const lowStockCount = lowStockItems.length;

        // 4. Maintenance & Machine Status
        const operationalMachines = machines.filter(m => m.status === 'Operational').length;
        const breakdownMachines = machines.filter(m => m.status === 'Breakdown').length;
        const totalMachines = machines.length;

        const machineStatusList = machines.map(m => ({
            _id: m._id,
            name: m.name,
            status: m.status,
            type: m.type
        }));

        const criticalMaintenance = maintenance.filter(m => m.priority === 'Critical' && m.status !== 'Completed').length;
        const pendingWorkOrders = maintenance.filter(m => m.status === 'Pending').length;

        // 5. System Health
        const activeUsers = users.length;

        // 6. Chart Data (Last 7 Days)
        const getLast7Days = () => {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                days.push(d.toISOString().split('T')[0]);
            }
            return days;
        };

        const last7Days = getLast7Days();
        const chartData = last7Days.map(date => {
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

            const daysSales = sales.filter(s => {
                if (!s.date) return false;
                return new Date(s.date).toLocaleDateString('en-CA') === dateStr;
            }).reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

            const daysProduction = productionLogs.filter(p => {
                if (!p.date) return false;
                return new Date(p.date).toLocaleDateString('en-CA') === dateStr;
            }).reduce((acc, curr) => acc + (curr.metersProduced || 0), 0);

            return {
                name: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: daysSales,
                production: daysProduction,
                fullDate: date
            };
        });

        // 7. Recent Activity
        const recentActivity = [
            ...sales.map(s => ({
                id: s._id,
                type: 'Sale',
                message: `New sale of Rs. ${s.totalAmount}`,
                date: s.createdAt,
                status: 'success'
            })),
            ...maintenance.map(m => ({
                id: m._id,
                type: 'Maintenance',
                message: `${m.machineId?.name || 'Machine'} reported ${m.type}`,
                date: m.createdAt,
                status: m.priority === 'Critical' ? 'danger' : 'warning'
            })),
            ...productionOrders.map(p => ({
                id: p._id,
                type: 'Production',
                message: `Order ${p.orderNumber} ${p.status}`,
                date: p.createdAt,
                status: 'info'
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        // 8. Pending Actions
        const pendingActions = [
            ...lowStockItems.map(m => ({
                _id: m._id, // Add _id for key prop
                title: `Reorder ${m.materialName}`,
                type: 'Stock',
                priority: 'High'
            })),
            ...maintenance.filter(m => m.status === 'Pending').map(m => ({
                _id: m._id, // Add _id for key prop
                title: `Approve Repair: ${m.machineId?.name || 'Unknown'}`,
                type: 'Maintenance',
                priority: m.priority
            }))
        ].slice(0, 5);

        res.json({
            stats: {
                totalRevenue,
                totalProduction,
                activeProductionOrders,
                lowStockCount,
                criticalMaintenance,
                pendingWorkOrders,
                activeUsers,
                efficiencyRate,
                operationalMachines,
                breakdownMachines,
                totalMachines,
                lowStockCount // Ensure this is passed
            },
            machineStatusList,
            chartData,
            recentActivity,
            pendingActions
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getDashboardStats };
