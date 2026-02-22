const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const bootstrap = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB:', process.env.MONGO_URI);

        const adminData = {
            name: 'System Admin',
            email: 'admin@naka.com',
            password: 'adminpassword123',
            role: 'admin'
        };

        const existingUser = await User.findOne({ email: adminData.email });

        if (existingUser) {
            console.log('User exists. Updating password and role to ensure access...');
            existingUser.password = adminData.password;
            existingUser.role = adminData.role;
            await existingUser.save();
            console.log('Admin user updated successfully');
        } else {
            await User.create(adminData);
            console.log('Admin user created successfully');
        }

        console.log('--- LOGIN CREDENTIALS ---');
        console.log('Email: admin@naka.com');
        console.log('Password: adminpassword123');
        console.log('-------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error during bootstrap:', error.message);
        process.exit(1);
    }
};

bootstrap();
