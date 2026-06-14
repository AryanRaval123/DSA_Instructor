import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const ai = new GoogleGenAI({apiKey : "AQ.Ab8RN6KqUPMF2y3yPNnM48zsNjJVaBGLxxFcEFKgFeNjflZ6VA"});

const history = []
async function chatting(userProblem) {

    history.push({
        role:'user',
        parts:[{text:userProblem}]
    })

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: history,
        config : {
            systemInstruction : `you have to act as a Data structure and algorithm instructor and answer the user query in the simplest way and if user ask anything out of the box that it
            irrevelant to the Data structure and algorithm you will answer user yourself rudely
            
            like if user asks, 
            'user':'hello how are you'
            answer like ask me some sensible question
            ,you reply like this yourself

            and if user ask question related to Data
             structure and algorithm, answer them
            `
        }
    });

    history.push({
        role:'model',
        parts:[{text:response.text}]
    })

  console.log(response.text);
}


async function main() {
    var userProblem = readlineSync.question("Ask me Anything--> ")
    await chatting(userProblem)
    main()
}

main();