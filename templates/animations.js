// Enhanced audio functions
function playSound() {
    const sound = document.getElementById("talk-sound");
    const aiAvatar = document.querySelector(".ai-avatar img");
    
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error("Error playing sound:", error));
    } else {
        console.error("Audio element not found");
    }
    
    // Show the animated GIF only when talking
    if (aiAvatar) {
        aiAvatar.src = "Clips/LCPT.gif";
        aiAvatar.classList.add("ai-talking");
    }
}

function stopSound() {
    const sound = document.getElementById("talk-sound");
    const aiAvatar = document.querySelector(".ai-avatar img");
    
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
    
    // Switch back to a static image when not talking
    if (aiAvatar) {
        aiAvatar.src = "Images/LCPT-static.png"; // You'll need to create this static image
        aiAvatar.classList.remove("ai-talking");
    }
}


// Initialize the page with static image for AI avatar
document.addEventListener('DOMContentLoaded', () => {
    // Initialize static AI image
    const aiAvatar = document.querySelector(".ai-avatar img");
    if (aiAvatar) {
        // Store the animated GIF path
        aiAvatar.dataset.animatedSrc = aiAvatar.src;
        // Create and set static image path
        aiAvatar.src = "Images/LCPT-static.png"; // Make sure to create this static image
    }
    
    // Initialize tasks
    loadTasks();
    
    // Initialize quick links
    loadQuickLinks();
    
    // Setup form submission event listener for task form if it exists
    const taskForm = document.querySelector('form#task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            addTask();
        });
    }
    
    // Setup event listener for chat form if it exists
    const chatForm = document.querySelector('form#chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    
    // Set up modal close button
    const closeButton = document.querySelector('.close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('add-link-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Add enter key support for chat input
    const chatMessageInput = document.getElementById('chat-message');
    if (chatMessageInput) {
        chatMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Add enter key support for task input
    const taskInput = document.getElementById('task-input');
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }
    
    // Add element animations on page load
    animateElementsOnLoad();
});

// New function to animate elements when page loads
function animateElementsOnLoad() {
    // Add animation classes to main containers
    document.querySelector('.sidebar')?.classList.add('slide-in-left');
    document.querySelector('.main')?.classList.add('fade-in');
    document.querySelector('.rightbar')?.classList.add('slide-in-right');
    
    // Animate logo with delay
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.classList.add('pop-in');
        logo.style.animationDelay = '0.3s';
    }
    
    // Stagger the animation of section containers
    const sections = document.querySelectorAll('.tasks, .feed, .quick-links, .profile, .ai-avatar, .chat-output, .chat-input');
    sections.forEach((section, index) => {
        section.classList.add('fade-in-up');
        section.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
}


function saveQuickLinks() {
    try {
        const links = [];
        document.querySelectorAll(".quick-links-buttons .quick-link-btn").forEach(link => {
            // Skip the default links
            if (link.querySelector(".fab")) return;
            
            links.push({
                name: link.title,
                url: link.href,
                icon: link.querySelector("i").className.replace("fas ", "")
            });
        });
        
        localStorage.setItem("quickLinks", JSON.stringify(links));
    } catch (error) {
        console.error("Error saving quick links:", error);
    }
}

