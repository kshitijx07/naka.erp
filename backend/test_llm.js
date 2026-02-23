const dotenv = require('dotenv');
dotenv.config();

// Polyfill fetch to fix Node 18+ undici IPv6 hang
global.fetch = require('node-fetch');

const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");

async function testLLM() {
    console.log("Initializing LLM...");
    try {
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-flash-latest",
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0,
            maxRetries: 1, // Fail fast if there's connection issues
        });

        console.log("Invoking simple prompt...");
        const res = await llm.invoke("What is 2+2? Only output the number.");
        console.log("LLM response:", res.content);
        process.exit(0);
    } catch (e) {
        console.error("LLM Test Failed:", e);
        process.exit(1);
    }
}

testLLM();
