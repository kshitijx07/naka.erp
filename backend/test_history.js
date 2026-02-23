const dotenv = require('dotenv');
dotenv.config();
// Fix Node 18+ native fetch IPv6 connection hang
require('node:dns').setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
const { processChat } = require('./services/aiService');

async function testHistory() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected.");

        const chatHistory = [["Human", "Hello"]];
        console.log("Testing processChat with chatHistory:", chatHistory);

        const response = await processChat("What is Total Revenue", chatHistory);
        console.log("Success! Response:", response);
        process.exit(0);
    } catch (e) {
        console.error("Test failed with exception:");
        console.error(e);
        process.exit(1);
    }
}

testHistory();
