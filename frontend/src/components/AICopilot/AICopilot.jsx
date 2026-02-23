import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DynamicRenderer from './DynamicRenderer';
import api from '../../services/api'; // Import your configured axios instance
import './AICopilot.css';

const AICopilot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Naka ERP Assistant. Ask me about **sales**, **inventory**, or **production orders**.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasApiKeyError, setHasApiKeyError] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    // Very basic parser to extract JSON blocks from markdown meant for the DynamicRenderer
    const parseMessageContent = (content) => {
        try {
            // Look for a JSON block explicitly marked as 'json render-config' or just containing chart config
            const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
            const match = content.match(jsonRegex);

            if (match) {
                const jsonStr = match[1];
                // Check if it looks like our config
                if (jsonStr.includes('"type":')) {
                    const parsed = JSON.parse(jsonStr);
                    const textPart = content.replace(jsonRegex, '').trim();
                    return { text: textPart, config: parsed };
                }
            }
        } catch (e) {
            // Ignore parse errors, just render as text
        }
        return { text: content, config: null };
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setHasApiKeyError(false);

        // Add user message to UI
        const updatedMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(updatedMessages);
        setIsLoading(true);

        try {
            // Prepare chat history (exclude intro message)
            const chatHistory = messages.slice(1).map(m => [m.role === 'user' ? 'human' : 'ai', m.content]);

            const response = await api.post('/ai/chat', {
                message: userMessage,
                chatHistory: chatHistory
            });

            setMessages([...updatedMessages, { role: 'assistant', content: response.data.content }]);
        } catch (error) {
            console.error('AI Chat Error:', error);

            const isMissingKey = error.response?.data?.message?.includes('GEMINI_API_KEY');
            const status = error.response?.status;

            if (isMissingKey) {
                setHasApiKeyError(true);
                setMessages([...updatedMessages, {
                    role: 'assistant',
                    content: '⚠️ **Missing API Key**\n\nI need a Google Gemini API key to function. Please add `GEMINI_API_KEY=your_key_here` to the backend `.env` file and restart the server.'
                }]);
            } else if (status === 429) {
                setMessages([...updatedMessages, {
                    role: 'assistant',
                    content: '⚠️ **Too Many Requests**\n\nThe AI Copilot is currently processing too many questions (Free Tier Limit). Please wait about 15 seconds and try asking again.'
                }]);
            } else if (status === 401) {
                setMessages([...updatedMessages, {
                    role: 'assistant',
                    content: '⚠️ **Session Expired**\n\nYour session has expired. Please log out and log back in to continue using the Copilot.'
                }]);
            } else {
                setMessages([...updatedMessages, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error while processing your request. Please try again.'
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="ai-copilot-container">
            {!isOpen && (
                <button className="ai-copilot-toggle" onClick={() => setIsOpen(true)}>
                    <Bot size={28} />
                </button>
            )}

            {isOpen && (
                <div className="ai-copilot-window">
                    {/* Header */}
                    <div className="ai-copilot-header">
                        <div className="ai-copilot-title">
                            <Bot size={20} />
                            Naka AI Copilot
                        </div>
                        <button className="ai-copilot-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="ai-copilot-messages">
                        {messages.map((msg, idx) => {
                            const { text, config } = parseMessageContent(msg.content);

                            return (
                                <div key={idx} className={`ai-message-wrapper ${msg.role}`}>
                                    <div className="ai-message-bubble">
                                        <ReactMarkdown>{text}</ReactMarkdown>
                                        {config && <DynamicRenderer config={config} />}
                                    </div>
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="ai-message-wrapper assistant">
                                <div className="ai-message-bubble ai-typing-indicator">
                                    <div className="ai-typing-dot"></div>
                                    <div className="ai-typing-dot"></div>
                                    <div className="ai-typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form className="ai-copilot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="ai-copilot-input"
                            placeholder="Ask about sales, production, etc..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading || hasApiKeyError}
                        />
                        <button
                            type="submit"
                            className="ai-copilot-send"
                            disabled={isLoading || !input.trim() || hasApiKeyError}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AICopilot;
