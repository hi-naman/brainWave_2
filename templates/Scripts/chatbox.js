// Gemini API configuration (keeping this for potential future use)
const GEMINI_API_KEY = 'AIzaSyDGzPa6ylr8tNjURXH2-Xr83dyHnBEbS4E';
let geminiChat = null;

/**
 * Add a message to the chat UI
 * @param {string} sender - Name of the message sender
 * @param {string} message - Content of the message
 * @param {boolean} isUser - Whether the message is from the user
 */
function addMessageToChat(sender, message, isUser) {
    const chatOutput = document.getElementById('chat-output');
    if (!chatOutput) {
        console.error('Chat output element not found');
        speakText('Chat output element not found');
        return;
    }

    const messageElement = document.createElement('div');
    messageElement.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    // Apply special formatting to AI responses
    if (!isUser) {
        messageElement.classList.add('formatted-response');
        messageElement.innerHTML = `<div class='formatted-content'>${message.replace(/\n/g, '<br>')}</div>`;
    } else {
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
    }

    chatOutput.appendChild(messageElement);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

/**
 * Add a typing indicator to the chat
 */
function addTypingIndicator() {
    const chatOutput = document.querySelector('.chat-output') || document.getElementById('chat-output');
    if (!chatOutput) {
        console.error('Chat output element not found');
        return;
    }

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message ai-message typing-indicator';
    typingIndicator.innerHTML = '<span></span><span></span><span></span>';
    chatOutput.appendChild(typingIndicator);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

/**
 * Remove the typing indicator from the chat
 */
function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

/**
 * Send a message to the Flask backend and handle the response
 */

async function sendMessage() {
    const chatInput = document.getElementById('chat-message');
    const outputArea = document.querySelector('.chat-output') || document.getElementById('chat-output');
    
    if (!chatInput || !outputArea) {
        console.error('Chat input or output element not found');
        return;
    }

    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Add user message to chat
    addMessageToChat("You", userMessage, true);

    // Clear input
    chatInput.value = '';

    // Show typing indicator
    addTypingIndicator();

    try {
        const response = await fetch('/query', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ query: userMessage })
        });

        removeTypingIndicator();

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        // Add AI response to chat with formatting
        addMessageToChat("BRAINwave AI", data.response, false);
        speakText(data.response);
    } catch (error) {
        console.error('Error:', error);
        removeTypingIndicator();
        addMessageToChat("BRAINwave AI", "Sorry, there was an error processing your request.", false);
        speakText("Sorry, there was an error processing your request.");
    }
}

/**
 * Play the talk sound
 */
function playSound() {
    const sound = document.getElementById('talk-sound');
    if (sound) {
        sound.play().catch(error => console.error('Error playing sound:', error));
    }
}

/**
 * Stop the talk sound
 */
function stopSound() {
    const sound = document.getElementById('talk-sound');
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

/**
 * Initialize chat-related event listeners
 */
function initializeChatEvents() {
    const chatInput = document.getElementById('chat-message');
    const sendButton = document.querySelector('.chat-input button');
    const aiRespondButton = document.querySelector('.controls button:nth-child(2)');

    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    if (aiRespondButton) {
        aiRespondButton.addEventListener('click', () => {
            addMessageToChat("BRAINwave AI", "Hello there ! What can I help you with today?", false);
            speakText("Hello there ! What can I help you with today?")
        });
    }
}

// Initialize event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeChatEvents);


let isSpeaking = false;

// Function to enable AI voice response
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 9.0;

        // Start pulsating effect
        const aiAvatar = document.querySelector('.ai-avatar img');
        isSpeaking = true;
        aiAvatar.classList.add('pulsating');
        
        // Listen for when speech ends
        utterance.onend = function() {
            // Stop pulsating effect
            isSpeaking = false;
            aiAvatar.classList.remove('pulsating');
        };

        speechSynthesis.speak(utterance);
    } else {
        console.error("Text-to-Speech is not supported in this browser.");
    }
}

// Add a function to stop the pulsating effect when speech is stopped
function stopSound() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        // Stop pulsating effect
        const aiAvatar = document.querySelector('.ai-avatar img');
        isSpeaking = false;
        aiAvatar.classList.remove('pulsating');
    }
}

// Function to generate email response using Gemini API
async function generateEmailResponse(prompt) {
    const API_KEY = "AIzaSyB17WEN7VTbaw10AJSfxJ48SNSRJDvBjBQ";
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateText?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: { text: prompt } })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.output || "I couldn't generate a response.";
}

// Function to send email via Gmail API
async function sendEmailWithAI(recipient, subject, prompt) {
    const emailBody = await generateEmailResponse(prompt);
    const emailContent = [
        `To: ${recipient}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/plain; charset=utf-8",
        "",
        emailBody
    ].join("\n");
    
    const encodedEmail = btoa(unescape(encodeURIComponent(emailContent)));
    
    const user = auth.currentUser;
    if (!user) {
        alert("Please sign in first.");
        return;
    }
    
    const token = await user.getIdToken();
    
    fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw: encodedEmail })
    })
    .then(response => response.json())
    .then(data => console.log("Email sent:", data))
    .catch(error => console.error("Error sending email:", error));
}

// Detect email request in chat
function handleChatMessage(userInput) {
    const emailMatch = userInput.match(/send email to (.+) about (.+)/i);
    if (emailMatch) {
        const recipient = emailMatch[1].trim();
        const subject = emailMatch[2].trim();
        const prompt = `Write a professional email about ${subject}.`;
        sendEmailWithAI(recipient, subject, prompt);
    } else {
        getGeminiResponse(userInput);
    }
}


// #######
// Detect email request with recent activity
async function handleChatMessage(userInput) {
    const emailMatch = userInput.match(/send email to (.+) about (.+)/i);
    
    if (emailMatch) {
        const recipient = emailMatch[1].trim();
        const subject = emailMatch[2].trim();

        // Fetch recent activity from Firebase
        const response = await fetch(`/recent-activity?user_id=YOUR_USER_ID`);
        const activityData = await response.json();

        const prompt = `Draft an email to ${recipient} about ${subject}. Recent activity: ${activityData.join("\n")}`;
        
        const emailBody = await generateEmailResponse(prompt);
        
        addMessageToChat("BRAINwave AI", `**Drafted Email:**\n\n${emailBody}`, false);
    } else {
        getGeminiResponse(userInput);
    }
}
