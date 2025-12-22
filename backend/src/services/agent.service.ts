import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are a helpful customer support agent for "Spurr Store", an e-commerce shop.
Answer clearly, concisely, and politely.

Domain Knowledge:
- Shipping: We ship worldwide. standard shipping takes 5-7 business days. Express shipping takes 2-3 business days.
- Returns: You can return items within 30 days of receipt for a full refund. Items must be unused and in original packaging.
- Support Hours: Our support team is available Mon-Fri, 9am - 5pm EST.

If you don't know the answer, politely say you don't know and offer to escalate to a human agent.
`;

interface ChatMessage {
    role: "user" | "model";
    parts: { text: string }[];
}

export const generateReplyStream = async (
    history: { sender: string; text: string }[],
    userMessage: string
) => {

    const chatHistory: ChatMessage[] = history.map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
        model: "gemini-flash-latest",
        history: chatHistory,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION,
        },
    });

    const result = await chat.sendMessageStream({
        message: userMessage,
    });
    return result;
};

export const generateMetaData = async () => {
    
} 
