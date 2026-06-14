const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatBox = document.getElementById('chatBox');
const sendBtn = document.getElementById('sendBtn');

// Stores the persistent chat history array on the client's end
let chatHistory = [];

// Helper function to append message balloons to the chat display
function appendMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    if (sender === 'user') {
        messageDiv.classList.add('user-message');
    } else {
        messageDiv.classList.add('model-message');
    }
    
    // Using textContent to prevent cross-site scripting (XSS) issues.
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    
    // Keeps scroll bar focused on the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Visual indicator during generation
function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.classList.add('message', 'model-message');
    indicator.id = 'typingIndicator';
    indicator.textContent = 'Typing...';
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// Handle message submission
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageText = userInput.value.trim();
    if (!messageText) return;
    
    // Immediate UI updates
    userInput.value = '';
    appendMessage('user', messageText);
    
    // Disable inputs while request is in flight
    userInput.disabled = true;
    sendBtn.disabled = true;
    showTypingIndicator();
    console.log("before","hello");
    try {
        const response = await fetch('http://localhost:3000/api/chat/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                history: chatHistory,
                message: messageText
            })
        });

        if (!response.ok) {
            throw new Error('Server returned an error');
        }
        console.log("before","hello");
        const data = await response.json();
        
        removeTypingIndicator();
        appendMessage('model', data.reply);
        
        // Update client history with the history array returned by the server
        chatHistory = data.history;

    } catch (error) {
        console.error('Error contacting the server:', error);
        removeTypingIndicator();
        appendMessage('model', 'Error: Failed to fetch response. Please try again.');
    } finally {
        // Re-enable form controls
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
});