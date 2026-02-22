const mongoose = require('mongoose');

const salarySchema = mongoose.Schema(
    {
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        month: {
            type: String, // e.g., "October 2023"
            required: true,
        },
        totalMeters: {
            type: Number,
            required: true,
        },
        baseAmount: {
            type: Number,
            required: true,
        },
        hourlyRate: {
            type: Number,
            required: true,
            default: 0,
        },
        workHours: {
            type: Number,
            required: true,
            default: 0,
        },
        bonus: {
            type: Number,
            default: 0,
        },
        deductions: {
            type: Number,
            default: 0,
        },
        overtime: {
            type: Number,
            default: 0,
        },
        finalSalary: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

const Salary = mongoose.model('Salary', salarySchema);

module.exports = Salary;
