const express = require('express');
const router = express.Router();
const { processChat } = require('../services/aiService');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ai/chat
// @desc    Process a message via the Agentic AI
// @access  Private
router.post('/chat', protect, async (req, res) => {
    try {
        const { message, chatHistory } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Please provide a message' });
        }

        const aiResponse = await processChat(message, chatHistory || []);

        res.json({
            role: 'assistant',
            content: aiResponse
        });
    } catch (error) {
        console.error('AI Route Error:', error.message);

        // Handle Gemini Quota / Rate Limiting
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('Too Many Requests')) {
            return res.status(429).json({
                message: 'AI Service is currently busy. Please wait 10-20 seconds and try again. (Free Tier Limit Reached)'
            });
        }

        res.status(500).json({
            message: error.message || 'Error processing AI chat'
        });
    }
});

module.exports = router;
