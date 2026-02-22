const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const bootstrap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminExists = await User.findOne({ email: 'admin@naka.com' });
        if (adminExists) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        await User.create({
            name: 'System Admin',
            email: 'admin@naka.com',
            password: 'adminpassword123', // You should change this after login
            role: 'admin'
        });

        console.log('Admin user created successfully');
        console.log('Email: admin@naka.com');
        console.log('Password: adminpassword123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        process.exit(1);
    }
};

bootstrap();
