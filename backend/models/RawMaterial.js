const mongoose = require('mongoose');

const rawMaterialSchema = mongoose.Schema(
    {
        materialName: {
            type: String,
            required: true,
            unique: true,
        },
        receivedQuantity: {
            type: Number,
            default: 0,
        },
        issuedQuantity: {
            type: Number,
            default: 0,
        },
        remainingStock: {
            type: Number,
            required: true,
            index: true,
        },
        category: {
            type: String,
            default: 'General',
        },
        unit: {
            type: String,
            default: 'kg',
        },
        pricePerUnit: {
            type: Number,
            default: 0,
        },
        lowStockThreshold: {
            type: Number,
            required: true,
            default: 10,
        },
    },
    {
        timestamps: true,
    }
);

const RawMaterial = mongoose.model('RawMaterial', rawMaterialSchema);

module.exports = RawMaterial;
