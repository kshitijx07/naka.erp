const mongoose = require('mongoose');

const maintenanceSchema = mongoose.Schema(
    {
        machineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['Routine', 'Breakdown', 'Repair', 'Inspection'],
            default: 'Breakdown',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
            default: 'Pending',
        },
        technician: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Assign to a user/technician
        },
        partsUsed: [{
            materialId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'RawMaterial',
            },
            quantity: { type: Number, required: true },
            cost: { type: Number, default: 0 }
        }],
        cost: {
            type: Number,
            default: 0, // Total cost (parts + labor)
        },
        downtimeMinutes: {
            type: Number,
            default: 0,
        },
        startDate: {
            type: Date,
        },
        completionDate: {
            type: Date,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    {
        timestamps: true,
    }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
