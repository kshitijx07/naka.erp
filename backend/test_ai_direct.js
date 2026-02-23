// Load env vars immediately
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { processChat } = require('./services/aiService');

async function directTest() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected. Testing AI service...");

        // Test the agent
        const response = await processChat("Give me a quick summary of the inventory status.");
        console.log("\n--- AI Response ---");
        console.log(response);
        console.log("-------------------\n");

        process.exit(0);
    } catch (e) {
        console.error("Test failed:", e);
        process.exit(1);
    }
}

directTest();
