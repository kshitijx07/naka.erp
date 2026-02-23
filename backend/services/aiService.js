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

            const sales = await Sales.find({ date: { $gte: dateLimit } });
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
            const items = await RawMaterial.find({});
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
            const orders = await ProductionOrder.find(query).populate('assignedMachine').populate('assignedWorker');

            return JSON.stringify({
                count: orders.length,
                orders: orders.map(o => ({
                    orderNumber: o.orderNumber,
                    productName: o.productName,
                    status: o.status,
                    targetQuantity: o.targetQuantity,
                    producedQuantity: o.producedQuantity
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
        ["system", `You are a helpful and intelligent ERP Assistant for Naka Integrated Systems. 
You can query the database using the provided tools to answer user questions about sales, inventory, and production.
Always answer accurately based ONLY on the data returned by the tools.
If the user asks for a chart or graph, structure your final response to include a 'chartConfig' object in JSON.
For standard text replies, just respond naturally.`],
        ["placeholder", "{chat_history}"],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
    ]);

    const agent = createToolCallingAgent({ llm, tools, prompt });
    agentExecutor = new AgentExecutor({ agent, tools });
};

// Initialize on startup
initializeAgent();

// --- Main Chat Function ---
const processChat = async (input, chatHistory = []) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is missing from the environment variables. Please add it to .env.");
    }

    if (!agentExecutor) {
        throw new Error("Agent not initialized.");
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

        return result.output;
    } catch (error) {
        console.error("AI Error:", error);
        throw new Error("Failed to process AI request: " + error.message);
    }
};

module.exports = {
    processChat
};
