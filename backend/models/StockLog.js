const mongoose = require('mongoose');

const stockLogSchema = mongoose.Schema(
    {
        materialId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RawMaterial',
            required: true,
        },
        type: {
            type: String,
            enum: ['Received', 'Issued', 'Adjustment'],
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        reason: {
            type: String,
            default: '',
        },
        date: {
            type: Date,
            default: Date.now,
        }
    },
    {
        timestamps: true,
    }
);

const StockLog = mongoose.model('StockLog', stockLogSchema);

module.exports = StockLog;
