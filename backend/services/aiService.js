const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { AgentExecutor, createToolCallingAgent } = require("langchain/agents");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { z } = require("zod");

// Import Database Models
const Sales = require("../models/Sales");
const RawMaterial = require("../models/RawMaterial");
const ProductionOrder = require("../models/ProductionOrder");

// --- Define AI Tools ---

// 1. Tool to get Sales Data
const getSalesDataTool = new DynamicStructuredTool({
    name: "get_sales_data",
    description: "Fetch recent sales metrics, total revenue, and meters sold from the database.",
    schema: z.object({
        days: z.number().optional().describe("Number of past days to query. Defaults to 30.")
    }),
    func: async ({ days }) => {
        try {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - (days || 30));

            const sales = await Sales.find({ date: { $gte: dateLimit } }).select('totalAmount metersSold').lean();
            const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            const totalMeters = sales.reduce((sum, sale) => sum + sale.metersSold, 0);

            return JSON.stringify({
                summary: `Found ${sales.length} sales in the last ${days} days. Total Revenue: $${totalRevenue}. Total Meters Sold: ${totalMeters}.`,
                recentSales: sales.slice(0, 10) // Only return top 10 to avoid token limits
            });
        } catch (error) {
            return `Error fetching sales data: ${error.message}`;
        }
    }
});

// 2. Tool to get Inventory/Raw Materials
const getInventoryTool = new DynamicStructuredTool({
    name: "get_inventory_status",
    description: "Fetch current raw material inventory and identify low stock items.",
    schema: z.object({}), // No specific arguments needed
    func: async () => {
        try {
            const items = await RawMaterial.find({}).select('materialName remainingStock lowStockThreshold').lean();
            const lowStockItems = items.filter(item => item.remainingStock <= item.lowStockThreshold);

            return JSON.stringify({
                totalItems: items.length,
                lowStockItems: lowStockItems.map(i => ({ name: i.materialName, remaining: i.remainingStock, threshold: i.lowStockThreshold }))
            });
        } catch (error) {
            return `Error fetching inventory data: ${error.message}`;
        }
    }
});

// 3. Tool to get Production Orders
const getProductionOrdersTool = new DynamicStructuredTool({
    name: "get_production_orders",
    description: "Fetch production orders, optionally filtered by status (e.g. 'In Progress', 'Completed', 'Planned').",
    schema: z.object({
        status: z.enum(['Planned', 'In Progress', 'Completed', 'Cancelled', 'On Hold']).optional().describe("Filter by order status")
    }),
    func: async ({ status }) => {
        try {
            const query = status ? { status } : {};
            const orders = await ProductionOrder.find(query)
                .select('orderNumber productName status targetQuantity producedQuantity assignedMachine assignedWorker')
                .populate('assignedMachine', 'name')
                .populate('assignedWorker', 'name')
                .sort({ createdAt: -1 })
                .limit(20) // Securely limit data size sent to LLM for speed
                .lean();

            return JSON.stringify({
                count: orders.length,
                note: orders.length === 20 ? "Results limited to 20 most recent to ensure fast responses." : "",
                orders: orders.map(o => ({
                    orderNumber: o.orderNumber,
                    productName: o.productName,
                    status: o.status,
                    targetQuantity: o.targetQuantity,
                    producedQuantity: o.producedQuantity,
                    machine: o.assignedMachine?.name || 'None',
                    worker: o.assignedWorker?.name || 'None'
                }))
            });
        } catch (error) {
            return `Error fetching production orders: ${error.message}`;
        }
    }
});

const tools = [getSalesDataTool, getInventoryTool, getProductionOrdersTool];

// --- Agent Initialization ---

let agentExecutor = null;

const initializeAgent = () => {
    // Ensure we have an API key, otherwise dummy it so the server doesn't crash on startup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is not set. The AI Agent will return an error if called.");
    }

    const llm = new ChatGoogleGenerativeAI({
        model: "gemini-flash-latest",
        apiKey: apiKey || "MISSING_KEY",
        temperature: 0,
    });

    const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are a secure, extremely fast, and intelligent ERP Assistant for Naka Integrated Systems. 
You can query the database using the provided tools to answer user questions about sales, inventory, and production.
- Always answer accurately based ONLY on the data returned by the tools.
- Do NOT guess or hallucinate any numbers or information.
- Be concise. Keep your text responses short and tightly focused on the user's question to save generation time.
- If the user asks for a chart or graph, structure your final response to include a 'chartConfig' object in JSON.
- For standard text replies, just respond naturally but briefly.`],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    agentExecutor = new AgentExecutor({ agent, tools });
};

// Initialize on startup
initializeAgent();

const queryCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- Main Chat Function ---
const processChat = async (input, chatHistory = []) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from the environment variables. Please add it to .env.");
    }

    if (!agentExecutor) {
        throw new Error("Agent not initialized.");
    }

    // Secure Cache Optimization: Skip LLM completely if exact input was queried recently
    const cacheKey = input.trim().toLowerCase();
    if (queryCache.has(cacheKey)) {
        const cached = queryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            console.log("Serving AI response from blazing fast memory cache.");
            return cached.response;
        } else {
            queryCache.delete(cacheKey); // Expire old cache
        }
    }

    try {
        const formattedHistory = chatHistory.map(msg => {
            if (msg[0] === 'human') return new HumanMessage(msg[1]);
            return new AIMessage(msg[1]);
        });

        const result = await agentExecutor.invoke({
            input: input,
            chat_history: formattedHistory,
        });

        // Store result in memory cache securely
        queryCache.set(cacheKey, {
            response: result.output,
            timestamp: Date.now()
        });

        return result.output;
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error("Failed to process AI request: " + error.message);
    }
};

module.exports = {
    processChat
};
