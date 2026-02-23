const axios = require('axios');
const jwt = require('jsonwebtoken');

// Generate a valid mock token for testing the protected route
const TEST_SECRET = 'supersecretkey123';
const token = jwt.sign({ id: 'test_admin_id', role: 'admin' }, TEST_SECRET);

async function testAI() {
    try {
        console.log("Testing AI endpoint...");
        const response = await axios.post('http://127.0.0.1:5000/api/ai/chat', {
            message: "Give me a quick summary of the inventory status."
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("\n--- AI Response ---");
        console.log(response.data.content);
        console.log("-------------------\n");
    } catch (e) {
        console.error("Test failed:", e.response ? e.response.data : e.message);
    }
}

testAI();
