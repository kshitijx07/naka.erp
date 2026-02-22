const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Maintenance = require('./models/Maintenance');
const Machine = require('./models/Machine');
const User = require('./models/User');

dotenv.config();

const seedMaintenance = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await Maintenance.deleteMany({});
        await Machine.deleteMany({});
        console.log('Cleared existing maintenance data');

        // Create Machines
        const machines = await Machine.insertMany([
            { name: 'Looms 101', type: 'Weaving Loom', location: 'Hall A', status: 'Operational', modelNumber: 'WL-2024-X' },
            { name: 'Spinning Unit 05', type: 'Spinning Frame', location: 'Hall B', status: 'Breakdown', modelNumber: 'SP-500' },
            { name: 'Dyeing Vat 03', type: 'Dyeing Machine', location: 'Dye House', status: 'Operational', modelNumber: 'DY-300' },
            { name: 'Conveyor Belt 02', type: 'Transport', location: 'Warehouse', status: 'Under Maintenance', modelNumber: 'CB-200' }
        ]);
        console.log('Machines Seeded');

        // Get a technician user (or admin if no tech exists)
        let technician = await User.findOne({ role: 'worker' });
        if (!technician) technician = await User.findOne({ role: 'admin' });

        if (!technician) {
            console.log('No user found to assign as technician. Skipping work orders.');
            process.exit();
        }

        // Create Work Orders
        const workOrders = [
            {
                machineId: machines[1]._id,
                description: 'Motor overheating during high-speed operation.',
                type: 'Breakdown',
                priority: 'High',
                status: 'In Progress',
                technician: technician._id,
                reportedBy: technician._id,
                startDate: new Date()
            },
            {
                machineId: machines[3]._id,
                description: 'Routine belt check and lubrication.',
                type: 'Routine',
                priority: 'Medium',
                status: 'Pending',
                technician: technician._id,
                reportedBy: technician._id
            },
            {
                machineId: machines[0]._id,
                description: 'Sensor misalignment causing false alarms.',
                type: 'Repair',
                priority: 'Low',
                status: 'Completed',
                technician: technician._id,
                reportedBy: technician._id,
                startDate: new Date('2023-10-20'),
                completionDate: new Date('2023-10-21')
            }
        ];

        await Maintenance.insertMany(workOrders);
        console.log('Work Orders Seeded');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedMaintenance();
