const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ProductionOrder = require('./models/ProductionOrder');
const RawMaterial = require('./models/RawMaterial');

dotenv.config();

const seedProductionOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing orders
        await ProductionOrder.deleteMany({});
        console.log('Cleared existing production orders');

        // Create logic to get some raw material IDs if needed, but for now we'll create simple orders
        // In a real scenario, you'd fetch materials and assign them

        const orders = [
            {
                orderNumber: 'PO-1001',
                productName: 'Cotton Fabric Type A',
                targetQuantity: 5000,
                producedQuantity: 1200,
                startDate: new Date('2023-10-01'),
                endDate: new Date('2023-10-15'),
                status: 'In Progress',
                priority: 'High',
                notes: 'Urgent client request'
            },
            {
                orderNumber: 'PO-1002',
                productName: 'Silk Blend Batch 4',
                targetQuantity: 2000,
                producedQuantity: 2000,
                startDate: new Date('2023-09-15'),
                endDate: new Date('2023-09-30'),
                status: 'Completed',
                priority: 'Medium',
                notes: 'Delivered successfully'
            },
            {
                orderNumber: 'PO-1003',
                productName: 'Polyester Sheet',
                targetQuantity: 10000,
                producedQuantity: 0,
                startDate: new Date('2023-10-20'),
                endDate: new Date('2023-11-05'),
                status: 'Planned',
                priority: 'Low',
                notes: 'Pending raw material arrival'
            }
        ];

        await ProductionOrder.insertMany(orders);
        console.log('Production Orders Seeded!');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedProductionOrders();
