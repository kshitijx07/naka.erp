const cron = require('node-cron');
const User = require('../models/User');
const Salary = require('../models/Salary');
const ProductionLog = require('../models/ProductionLog');
const { calculateSalary } = require('../utils/salaryCalculator');

const setupCronJobs = () => {
    // Run at 00:00 on the 1st of every month
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running monthly salary generation cron job...');

        try {
            const workers = await User.find({ role: 'worker' });

            // Get previous month string, e.g., "September 2023"
            const date = new Date();
            date.setMonth(date.getMonth() - 1);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });

            // Note: Date range for production query should be the full previous month
            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

            for (const worker of workers) {
                // Calculate total meters produced by worker in the previous month
                const productionRecords = await ProductionLog.find({
                    workerId: worker._id,
                    date: { $gte: startOfMonth, $lte: endOfMonth }
                });

                const totalMeters = productionRecords.reduce((acc, curr) => acc + curr.metersProduced, 0);

                // Check if salary record already exists
                const existingSalary = await Salary.findOne({ workerId: worker._id, month });

                if (!existingSalary) {
                    const { baseSalary, finalSalary } = calculateSalary(
                        totalMeters,
                        worker.salaryRate,
                        0, // Bonus manually added later
                        0, // Deductions manually added later
                        0  // Overtime manually added later
                    );

                    await Salary.create({
                        workerId: worker._id,
                        month,
                        totalMeters,
                        baseAmount: baseSalary,
                        finalSalary
                    });
                    console.log(`Salary generated for ${worker.name} for ${month}`);
                }
            }
            console.log('Monthly salary generation completed.');
        } catch (error) {
            console.error('Error in salary cron job:', error);
        }
    });
};

module.exports = setupCronJobs;
