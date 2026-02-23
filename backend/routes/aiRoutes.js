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
        res.status(500).json({
            message: error.message || 'Error processing AI chat'
        });
    }
});

module.exports = router;
