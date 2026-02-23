const dotenv = require('dotenv');
dotenv.config();

async function testNativeFetch() {
    console.log("Testing native fetch...");
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "What is 2+2?" }] }]
            })
        });

        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("Fetch failed:", e);
        process.exit(1);
    }
}

testNativeFetch();
