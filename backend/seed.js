const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

// Models
const User = require('./models/User');
const Sales = require('./models/Sales');
const ProductionLog = require('./models/ProductionLog');
const RawMaterial = require('./models/RawMaterial');
const Maintenance = require('./models/Maintenance');
const Salary = require('./models/Salary');
const Machine = require('./models/Machine'); // Added Machine

// Helper to get random date within last 30 days
const getRandomDate = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const importData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Sales.deleteMany();
        await ProductionLog.deleteMany();
        await RawMaterial.deleteMany();
        await Maintenance.deleteMany();
        await Salary.deleteMany();
        await Machine.deleteMany(); // Clear machines

        console.log('Data Destroyed...'.red.inverse);

        // --- USERS ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { name: 'Admin User', email: 'admin@naka.com', password: hashedPassword, role: 'admin', salaryRate: 0 },
            { name: 'Manager John', email: 'manager@naka.com', password: hashedPassword, role: 'manager', salaryRate: 50 },
            { name: 'Accountant Sarah', email: 'accountant@naka.com', password: hashedPassword, role: 'accountant', salaryRate: 40 },
            { name: 'Worker Alex', email: 'alex@naka.com', password: hashedPassword, role: 'worker', salaryRate: 15 },
            { name: 'Worker Sam', email: 'sam@naka.com', password: hashedPassword, role: 'worker', salaryRate: 15 },
            { name: 'Worker Mike', email: 'mike@naka.com', password: hashedPassword, role: 'worker', salaryRate: 15 },
            { name: 'Technician Dave', email: 'dave@naka.com', password: hashedPassword, role: 'worker', salaryRate: 25 }, // Added Technician
        ];

        const createdUsers = await User.insertMany(users);
        const adminUser = createdUsers[0]._id;
        const workerIds = createdUsers.filter(u => u.role === 'worker').map(u => u._id);
        const technicianUser = createdUsers.find(u => u.name === 'Technician Dave');

        console.log('Users Imported...'.green.inverse);

        // --- MACHINES ---
        const machines = [
            { name: 'Loom #1', type: 'Weaving', modelNumber: 'WL-2023-A', location: 'Floor 1', status: 'Operational' },
            { name: 'Loom #2', type: 'Weaving', modelNumber: 'WL-2023-B', location: 'Floor 1', status: 'Operational' },
            { name: 'Loom #3', type: 'Weaving', modelNumber: 'WL-2023-C', location: 'Floor 1', status: 'Breakdown' },
            { name: 'Loom #4', type: 'Weaving', modelNumber: 'WL-2023-D', location: 'Floor 1', status: 'Operational' },
            { name: 'Spinning Unit A', type: 'Spinning', modelNumber: 'SP-500', location: 'Floor 2', status: 'Operational' },
        ];

        const createdMachines = await Machine.insertMany(machines);
        const machineIds = createdMachines.map(m => m._id);
        console.log('Machines Imported...'.green.inverse);

        // --- RAW MATERIALS ---
        const materials = [
            { materialName: 'Cotton Yarn 40s', receivedQuantity: 5000, issuedQuantity: 1200, remainingStock: 3800, lowStockThreshold: 500 },
            { materialName: 'Polyester Fiber', receivedQuantity: 3000, issuedQuantity: 2800, remainingStock: 200, lowStockThreshold: 500 }, // Low stock
            { materialName: 'Silk Thread', receivedQuantity: 1000, issuedQuantity: 200, remainingStock: 800, lowStockThreshold: 100 },
            { materialName: 'Linen Raw', receivedQuantity: 2000, issuedQuantity: 1500, remainingStock: 500, lowStockThreshold: 400 },
            { materialName: 'Dye - Black', receivedQuantity: 500, issuedQuantity: 50, remainingStock: 450, lowStockThreshold: 50 },
            { materialName: 'Dye - Lime', receivedQuantity: 100, issuedQuantity: 80, remainingStock: 20, lowStockThreshold: 30 }, // Low stock
        ];

        await RawMaterial.insertMany(materials);
        console.log('Materials Imported...'.green.inverse);

        // --- SALES ---
        const customers = ['Zara Fabrics', 'H&M Global', 'Uniqlo Basics', 'Local Boutique', 'Export House'];
        const clothTypes = ['Cotton', 'Polyester', 'Silk', 'Linen', 'Blended'];
        const sales = [];

        for (let i = 0; i < 50; i++) {
            const metersSold = Math.floor(Math.random() * 5000) + 500;
            const rate = Math.floor(Math.random() * 10) + 5;
            sales.push({
                customerName: customers[Math.floor(Math.random() * customers.length)],
                clothType: clothTypes[Math.floor(Math.random() * clothTypes.length)],
                metersSold: metersSold,
                ratePerMeter: rate,
                totalAmount: metersSold * rate,
                paymentStatus: Math.random() > 0.2 ? 'Paid' : 'Pending',
                invoiceNumber: `INV-${1000 + i}`,
                date: getRandomDate(),
            });
        }
        await Sales.insertMany(sales);
        console.log('Sales Imported...'.green.inverse);

        // --- PRODUCTION ---
        const productionLogs = [];
        for (let i = 0; i < 60; i++) { // 2 logs per day roughly
            productionLogs.push({
                loomNumber: Math.floor(Math.random() * 7) + 1,
                workerId: workerIds[Math.floor(Math.random() * workerIds.length)],
                clothType: clothTypes[Math.floor(Math.random() * clothTypes.length)],
                metersProduced: Math.floor(Math.random() * 400) + 100,
                defects: Math.floor(Math.random() * 5),
                date: getRandomDate(),
            });
        }
        await ProductionLog.insertMany(productionLogs);
        console.log('Production Logs Imported...'.green.inverse);

        // --- MAINTENANCE ---
        const issues = ['Belt Broken', 'Motor Overheat', 'Needle Jam', 'Sensor Failure', 'Oil Leak'];
        const maintenanceLogs = [];

        for (let i = 0; i < 15; i++) {
            const isCritical = Math.random() > 0.8;
            maintenanceLogs.push({
                machineId: machineIds[Math.floor(Math.random() * machineIds.length)],
                description: issues[Math.floor(Math.random() * issues.length)],
                type: 'Breakdown',
                priority: isCritical ? 'Critical' : 'Medium',
                status: isCritical ? 'Pending' : 'Completed',
                cost: Math.floor(Math.random() * 500) + 50, // Changed from repairCost
                downtimeMinutes: Math.floor(Math.random() * 600) + 60, // Changed from downtimeHours
                technician: technicianUser ? technicianUser._id : workerIds[0], // Changed from repairedBy
                date: getRandomDate(),
            });
        }
        await Maintenance.insertMany(maintenanceLogs);
        console.log('Maintenance Logs Imported...'.green.inverse);

        // --- SALARY ---
        const salaryLogs = [];
        workerIds.forEach(id => {
            salaryLogs.push({
                workerId: id,
                month: 'October 2023',
                totalMeters: 5000,
                baseAmount: 2000,
                bonus: 200,
                deductions: 50,
                overtime: 10,
                finalSalary: 2150,
            });
        });
        await Salary.insertMany(salaryLogs);
        console.log('Salaries Imported...'.green.inverse);

        console.log('DATA IMPORTED SUCCESSFULLY!'.green.bold);
        process.exit();
    } catch (error) {
        console.error(`${error}`.red.inverse);
        process.exit(1);
    }
};

importData();
