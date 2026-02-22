const mongoose = require('mongoose');

const productionSchema = mongoose.Schema(
    {
        loomNumber: {
            type: Number,
            required: true,
            min: 1,
            max: 7,
        },
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        clothType: {
            type: String,
            required: true,
        },
        metersProduced: {
            type: Number,
            required: true,
        },
        defects: {
            type: Number,
            default: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const ProductionLog = mongoose.model('ProductionLog', productionSchema);

module.exports = ProductionLog;
