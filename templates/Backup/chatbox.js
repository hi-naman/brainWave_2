const apiKey = "AIzaSyB17WEN7VTbaw10AJSfxJ48SNSRJDvBjBQ";
const chatInput = document.getElementById("chat-message");
const chatOutput = document.getElementById("chat-output");

async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    displayMessage("You", userMessage);
    chatInput.value = "";

    try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=" + apiKey, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: userMessage }] }] })
        });

        const data = await response.json();
        if (data && data.candidates && data.candidates.length > 0) {
            displayMessage("AI", data.candidates[0].content.parts[0].text);
            speakText(data.candidates[0].content.parts[0].text);
        } else {
            displayMessage("AI", "Sorry, I couldn't generate a response.");
            speakText("Sorry, I couldn't generate a response.")
        }
    } catch (error) {
        displayMessage("AI", "Error contacting AI service.");
        speakText("Error contacting AI service.");
        console.error("Chat error:", error);
    }
}

function displayMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", sender === "You" ? "user" : "ai");
    messageDiv.innerText = `${sender}: ${message}`;
    chatOutput.appendChild(messageDiv);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}

document.getElementById("chat-message").addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});





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





// // Load chat history when the page loads
// window.onload = function() {
//     loadChatHistory();
// };

// // Function to store chat messages in local storage
// function saveMessage(user, message) {
//     let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
//     chatHistory.push({ user, message });
//     localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
// }

// function loadChatHistory() {
//     let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
//     chatHistory.forEach(({ user, message }) => displayMessage(user, message));
// }

// function displayMessage(user, message) {
//     const chatBox = document.getElementById("chatbox");
//     if (!chatBox) {
//         console.error("Chatbox element not found!");
//         return;
//     }

//     const messageElement = document.createElement("div");
//     messageElement.innerHTML = `<strong>${user}:</strong> ${message}`;
//     chatBox.appendChild(messageElement);
// }

