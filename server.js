import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public static files (our frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

// Initialize the Google Gen AI client using your securely stored API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { history, message } = req.body;
        console.log(history);
        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Initialize active history array if not already provided
        const activeHistory = history || [];

        // Append the user's incoming message to the chat history
        activeHistory.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Request text generation from Gemini
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: activeHistory,
            config: {
                systemInstruction: `you have to act as a Data structure and algorithm instructor and answer the user query in the simplest way and if user ask anything out of the box that it
irrevelant to the Data structure and algorithm you will answer user yourself rudely

like if user asks, 
'user':'hello how are you'
answer like ask me some sensible question
,you reply like this yourself

and if user ask question related to Data
 structure and algorithm, answer them`
            }
        });

        const modelResponseText = response.text;

        // Append the bot's response to the active conversation history
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;