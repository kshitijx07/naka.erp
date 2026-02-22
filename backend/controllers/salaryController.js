const Salary = require('../models/Salary');
const User = require('../models/User');
const { calculateSalary } = require('../utils/salaryCalculator');

// @desc    Get all salary records
// @route   GET /api/salary
// @access  Private (Accountant/Admin)
const getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find()
            .populate('workerId', 'name role')
            .sort({ month: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate salary for a worker for a specific month
// @route   POST /api/salary/generate
// @access  Private (Accountant/Admin)
const generateSalary = async (req, res) => {
    const { workerId, month, bonus, deductions, overtime, workHours } = req.body;

    try {
        const worker = await User.findById(workerId);
        if (!worker) return res.status(404).json({ message: 'Worker not found' });

        // Default or provided total meters (Legacy support or if needed later)
        let totalMeters = req.body.totalMeters || 0;

        const hourlyRate = worker.salaryRate || 0;
        const validWorkHours = Number(workHours) || 0;
        const validBonus = Number(bonus) || 0;
        const validDeductions = Number(deductions) || 0;
        const validOvertime = Number(overtime) || 0;

        // Calculate Base Amount based on Hours * Rate
        // If workHours is 0, maybe fall back to baseSalary if provided? 
        // For now, adhering to instruction: "calculate the payememt on base salaray on work hours"
        let baseAmount = hourlyRate * validWorkHours;

        // If user manually provided baseSalary in body (override), use it? 
        // Let's trust the calculation usually, but maybe allow override if hours are 0?
        if (req.body.baseSalary && baseAmount === 0) {
            baseAmount = Number(req.body.baseSalary);
        }

        // Final Calculation
        // Formula: Base + Bonus + Overtime - Deductions
        const finalSalary = baseAmount + validBonus + validOvertime - validDeductions;

        const salary = new Salary({
            workerId,
            month,
            totalMeters,
            baseAmount,
            hourlyRate,
            workHours: validWorkHours,
            bonus: validBonus,
            deductions: validDeductions,
            overtime: validOvertime,
            finalSalary,
            status: 'Pending', // Default status
        });

        const createdSalary = await salary.save();
        res.status(201).json(createdSalary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update salary record
// @route   PUT /api/salary/:id
// @access  Private (Admin)
const updateSalary = async (req, res) => {
    try {
        const { baseAmount, overtime, bonus, deductions, status } = req.body;
        const salary = await Salary.findById(req.params.id);

        if (!salary) return res.status(404).json({ message: 'Salary record not found' });

        // Update fields if provided
        if (baseAmount !== undefined) salary.baseAmount = Number(baseAmount);
        if (overtime !== undefined) salary.overtime = Number(overtime);
        if (bonus !== undefined) salary.bonus = Number(bonus);
        if (deductions !== undefined) salary.deductions = Number(deductions);
        if (status !== undefined) salary.status = status;

        // Recalculate Final Salary
        // Formula: Final = Base + Bonus + Overtime - Deductions
        salary.finalSalary = salary.baseAmount + salary.bonus + salary.overtime - salary.deductions;

        const updatedSalary = await salary.save();

        // Re-populate worker name for frontend consistency
        const populatedSalary = await Salary.findById(updatedSalary._id).populate('workerId', 'name email role');

        res.json(populatedSalary);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete salary record
// @route   DELETE /api/salary/:id
// @access  Private (Admin)
const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findById(req.params.id);

        if (!salary) return res.status(404).json({ message: 'Salary record not found' });

        await salary.deleteOne();
        res.json({ id: req.params.id });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { getSalaries, generateSalary, updateSalary, deleteSalary };
