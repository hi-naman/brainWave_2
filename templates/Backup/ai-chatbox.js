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
        } else {
            displayMessage("AI", "Sorry, I couldn't generate a response.");
        }
    } catch (error) {
        displayMessage("AI", "Error contacting AI service.");
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
