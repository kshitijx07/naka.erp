const mongoose = require('mongoose');

const salesSchema = mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true,
        },
        clothType: {
            type: String,
            required: true,
        },
        metersSold: {
            type: Number,
            required: true,
        },
        ratePerMeter: {
            type: Number,
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Pending'],
            default: 'Pending',
        },
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;
