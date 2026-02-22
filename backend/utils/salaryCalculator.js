const calculateSalary = (totalMeters, ratePerMeter, bonus, deductions, overtime) => {
    const baseSalary = totalMeters * ratePerMeter;
    const finalSalary = baseSalary + bonus - deductions + overtime;
    return { baseSalary, finalSalary };
};

module.exports = { calculateSalary };
