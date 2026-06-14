import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myapp = express();
const PORT = process.env.PORT || 3000;

// FIX 1: Serve static files directly from the root directory where your HTML/CSS/JS live
myapp.use(express.static(path.join(__dirname, './')));
myapp.use(express.json());
myapp.use(cors());

// Optional but highly recommended: Explicitly handle the root URL route
myapp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize the Google Gen AI client using your securely stored API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

myapp.post('/api/chat', async (req, res) => {
    try {
        const { history, message } = req.body;
        console.log(history);
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Initialize active history array if not already provided
        const activeHistory = history || [];

        // append the user's incoming message to the chat history
        activeHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Request text generation from Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Updated to the official stable 2.5 flash model
            contents: activeHistory,
            config: {
                systemInstruction: `you have to act as a Data structure and algorithm instructor and answer the user query in the simplest way and if user ask anything out of the box that it
irrevelant to the Data structure and algorithm you will answer user yourself rudely

like if user asks, 
'user':'hello how are you'
answer like ask me some sensible question
,you reply like this yourself

and if user ask question related to Data structure and algorithm, answer them`
            }
        });

        const modelResponseText = response.text;

        // append the bot's response to the active conversation history
        activeHistory.push({
            role: 'model',
            parts: [{ text: modelResponseText }]
        });

        // Send the reply and updated history back to the frontend
        res.json({
            reply: modelResponseText,
            history: activeHistory
        });

    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to communicate with the AI model." });
    }
});

// For local testing
if (process.env.NODE_ENV !== 'production') {
    myapp.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// FIX 2 & 3: Export the correct instance using ES module syntax for Vercel
export default myapp;