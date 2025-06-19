const chatMessages = document.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const minimizeBtn = document.querySelector('.minimize-btn');
const expandBtn = document.querySelector('.expand-btn');
const chatWindow = document.querySelector('.chat-window');

// Remove conversation state variables as LLM will manage state
// let conversationStep = 'TILE_TYPE'; // Initial step
// let tileType = '';
// let surfaceArea = 0;
// let areaUnit = '';
// let tileSize = '';

// Remove TILE_SIZES and related functions as LLM will provide options or parse input
// const TILE_SIZES = [...]
// function askTileType() { ... }
// function askAreaInput() { ... }
// function askTileSize() { ... }
// function performCalculation() { ... }

function addMessage(sender, message, isUser = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', isUser ? 'user-message' : 'bot-message');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addQuickReplies(replies) {
    const quickRepliesContainer = document.createElement('div');
    quickRepliesContainer.classList.add('quick-replies-container');

    replies.forEach(reply => {
        const button = document.createElement('button');
        button.classList.add('quick-reply-btn');
        button.textContent = reply;
        button.addEventListener('click', () => {
            userInput.value = reply;
            sendBtn.click();
            quickRepliesContainer.remove(); // Remove buttons after selection
        });
        quickRepliesContainer.appendChild(button);
    });
    chatMessages.appendChild(quickRepliesContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add a function to display bot typing indicator
function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot-message', 'typing-indicator');
    typingIndicator.innerHTML = '<strong>Bot:</strong> <span></span><span></span><span></span>';
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add a function to remove bot typing indicator
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function processUserInput(message) {
    addMessage('You', message, true);
    userInput.value = ''; // Clear input immediately

    showTypingIndicator(); // Show typing indicator

    try {
        const response = await fetch('/api/chat', { // Assuming a backend endpoint at /api/chat
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator(); // Remove typing indicator
        addMessage('Bot', data.reply); // Display bot's response

        // Handle quick replies if the bot sends them
        if (data.quick_replies && Array.isArray(data.quick_replies) && data.quick_replies.length > 0) {
            addQuickReplies(data.quick_replies);
        }

    } catch (error) {
        console.error('Error communicating with chatbot backend:', error);
        removeTypingIndicator(); // Remove typing indicator even on error
        addMessage('Bot', 'Sorry, I am having trouble connecting right now. Please try again later.');
    }
}

sendBtn.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message) {
        processUserInput(message);
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

minimizeBtn.addEventListener('click', () => {
    chatWindow.classList.add('minimized');
    expandBtn.style.display = 'block';
    minimizeBtn.style.display = 'none';
});

expandBtn.addEventListener('click', () => {
    chatWindow.classList.remove('minimized');
    minimizeBtn.style.display = 'block';
    expandBtn.style.display = 'none';
});

// Function to initiate the chat with the bot
async function startChat() {
    showTypingIndicator();
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: "start_conversation" }), // Special message to initiate conversation
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        removeTypingIndicator();
        addMessage('Bot', data.reply);
        if (data.quick_replies && Array.isArray(data.quick_replies) && data.quick_replies.length > 0) {
            addQuickReplies(data.quick_replies);
        }

    } catch (error) {
        console.error('Error initiating chat:', error);
        removeTypingIndicator();
        addMessage('Bot', 'Sorry, I could not start the chat. Please refresh the page.');
    }
}

// Call startChat to get the initial message from the bot when the page loads
startChat(); 