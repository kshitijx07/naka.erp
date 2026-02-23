const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function checkModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        console.log("Fetching models from Google AI...");
        const res = await axios.get(url);
        console.log("Success! Found models:");
        const names = res.data.models.map(m => m.name).filter(n => n.includes('gemini'));
        console.log(names);
    } catch (e) {
        if (e.response) {
            console.error("API Error:", e.response.status, e.response.data);
        } else {
            console.error("Request Error:", e.message);
        }
    }
}
checkModels();
