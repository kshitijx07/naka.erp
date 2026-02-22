const mongoose = require('mongoose');

const machineSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            required: true, // e.g., Loom, Generator, Spinning Frame
        },
        modelNumber: {
            type: String,
        },
        serialNumber: {
            type: String,
        },
        status: {
            type: String,
            enum: ['Operational', 'Under Maintenance', 'Breakdown', 'Sold', 'Scrapped'],
            default: 'Operational',
        },
        location: {
            type: String,
            default: 'Factory Floor',
        },
        installDate: {
            type: Date,
        },
        lastMaintenanceDate: {
            type: Date,
        },
        nextMaintenanceDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

const Machine = mongoose.model('Machine', machineSchema);

module.exports = Machine;
