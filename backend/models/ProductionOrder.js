const mongoose = require('mongoose');

const productionOrderSchema = mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },
        productName: {
            type: String,
            required: true,
        },
        targetQuantity: {
            type: Number,
            required: true,
        },
        producedQuantity: {
            type: Number,
            default: 0,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['Planned', 'In Progress', 'Completed', 'Cancelled', 'On Hold'],
            default: 'Planned',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
        },
        assignedMachine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Machine',
        },
        assignedWorker: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        materials: [
            {
                material: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'RawMaterial',
                },
                quantityPerUnit: {
                    type: Number,
                    required: true, // Amount needed per unit of product
                },
                totalConsumed: {
                    type: Number,
                    default: 0, // Track actual usage
                }
            }
        ],
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const ProductionOrder = mongoose.model('ProductionOrder', productionOrderSchema);

module.exports = ProductionOrder;
