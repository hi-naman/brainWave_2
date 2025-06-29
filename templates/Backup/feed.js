// News API Configuration
const NEWS_API_KEY = "1eedbb40c7814f04ae9b3fce323b2c48"; // Note: In production, this should be secured
const NEWS_API_URL = "https://newsapi.org/v2/everything?q=";

// Event listeners for page load
document.addEventListener('DOMContentLoaded', () => {
    // If the news list element exists, fetch news
    if (document.getElementById('news-list')) {
        fetchNews();
    }
});

// Unified fetchNews function
async function fetchNews(forceQuery) {
    const newsList = document.getElementById("news-list");
    if (!newsList) {
        console.error("News list element not found");
        return;
    }
    
    // Show loading indicator
    newsList.innerHTML = "<div class='loading-news'>Loading news<span class='dot-animation'>...</span></div>";
    
    // Get the toggle state
    const newsToggle = document.getElementById('news-toggle');
    const isResearchNews = newsToggle ? newsToggle.checked : false;
    
    // Set query based on toggle or force parameter
    let query = forceQuery;
    if (!query) {
        query = isResearchNews ? "science research technology innovation" : "daily news world current events";
    }
    
    try {
        // Make API request
        const res = await fetch(`${NEWS_API_URL}${query}&apiKey=${NEWS_API_KEY}`);
        if (!res.ok) {
            throw new Error(`News API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Check if we have articles
        if (data.articles && data.articles.length > 0) {
            bindData(data.articles);
        } else {
            newsList.innerHTML = "<div class='news-error'>No news articles found. Try a different search term.</div>";
            // Fall back to mock data if no articles
            setTimeout(() => useFallbackNewsData(isResearchNews), 1000);
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        newsList.innerHTML = "<div class='news-error'>Failed to load news. Please try again later.</div>";
        
        // Use fallback data
        setTimeout(() => useFallbackNewsData(isResearchNews), 1000);
    }
}

// Bind news data to the container
function bindData(articles) {
    const cardsContainer = document.getElementById('news-list');
    const newsCardTemplate = document.getElementById('template-news-card');
    
    if (!cardsContainer) {
        console.error("News container not found");
        return;
    }
    
    cardsContainer.innerHTML = "";
    
    // If template exists, use it
    const articlesToShow = articles.slice(0, 10).filter(article => article.urlToImage);
    
    if (newsCardTemplate) {
        articlesToShow.forEach((article, index) => {
            const cardClone = newsCardTemplate.content.cloneNode(true);
            fillDataInCard(cardClone, article, index);
            cardsContainer.appendChild(cardClone);
        });
    } else {
        // No template, create simple list items
        articlesToShow.forEach((article, index) => {
            let li = document.createElement("div");
            li.classList.add("news-card", "news-item-appear");
            li.style.animationDelay = `${index * 0.15}s`;
            
            const title = document.createElement("h4");
            title.id = "news-title";
            title.textContent = article.title || "Untitled Article";
            
            const source = document.createElement("p");
            source.id = "news-source";
            source.textContent = article.source?.name || "Unknown Source";
            
            li.appendChild(title);
            li.appendChild(source);
            
            li.addEventListener('click', () => {
                showNewsModal(
                    article.title,
                    article.description,
                    article.source?.name || "Unknown Source",
                    article.urlToImage,
                    new Date(article.publishedAt).toLocaleString()
                );
            });
            
            cardsContainer.appendChild(li);
        });
    }
}

// Fill data in the news card
function fillDataInCard(cardClone, article, index) {
    const newsTitle = cardClone.querySelector('#news-title');
    const newsSource = cardClone.querySelector('#news-source');
    const newsImg = cardClone.querySelector('.card-header img');
    const card = cardClone.querySelector('.card');
    
    if (newsTitle) newsTitle.textContent = article.title || "Untitled Article";
    if (newsSource) newsSource.textContent = article.source?.name || "Unknown Source";
    if (newsImg) newsImg.src = article.urlToImage || "Images/LCPT-static.png";
    
    if (card) {
        card.style.animationDelay = `${index * 0.15}s`;
        card.classList.add('card-appear');
        
        card.addEventListener('click', () => {
            showNewsModal(
                article.title,
                article.description,
                article.source?.name || "Unknown Source",
                article.urlToImage,
                new Date(article.publishedAt).toLocaleString()
            );
        });
    }
}

// Fallback news data function with toggle support
function useFallbackNewsData(isResearchNews) {
    const mockNews = isResearchNews 
        ? [
            {
                title: "Breakthrough in Quantum Computing Research",
                description: "Scientists achieve new milestone in quantum computing with stable qubits.",
                urlToImage: "Images/LCPT-static.png",
                source: { name: "Science Journal" },
                publishedAt: new Date().toISOString()
            },
            {
                title: "New AI Algorithm Improves Medical Diagnostics",
                description: "Researchers develop machine learning model that outperforms doctors in detecting early-stage diseases.",
                urlToImage: "Images/LCPT-static.png",
                source: { name: "AI Research Today" },
                publishedAt: new Date().toISOString()
            }
        ]
        : [
            {
                title: "Global Markets See Upswing After Policy Announcement",
                description: "Stock markets rally worldwide following central bank announcements.",
                urlToImage: "Images/LCPT-static.png",
                source: { name: "Business Daily" },
                publishedAt: new Date().toISOString()
            },
            {
                title: "New Infrastructure Bill Passes Legislature",
                description: "Lawmakers approve $1.2 trillion package focused on transportation and digital infrastructure.",
                urlToImage: "Images/LCPT-static.png",
                source: { name: "Politics Now" },
                publishedAt: new Date().toISOString()
            }
        ];
    
    bindData(mockNews);
}

// Show news modal function to display full article details
function showNewsModal(title, details, source, imageUrl, date) {
    // Remove existing modal if any
    const existingModal = document.getElementById("news-detail-modal");
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement("div");
    modal.id = "news-detail-modal";
    modal.className = "modal modal-fade-in";
    modal.style.display = "block";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content modal-slide-in";
    
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-modal";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
        modal.classList.add("modal-fade-out");
        modalContent.classList.add("modal-slide-out");
        modal.addEventListener("animationend", () => modal.remove(), { once: true });
    };
    
    const newsImage = document.createElement("img");
    newsImage.src = imageUrl || "Images/LCPT-static.png";
    newsImage.alt = title || "News Image";
    newsImage.style.width = "100%";
    newsImage.style.borderRadius = "10px";
    newsImage.style.marginBottom = "15px";

    const newsTitle = document.createElement("h3");
    newsTitle.textContent = title || "No Title";
    
    const newsDetails = document.createElement("p");
    newsDetails.textContent = details || "No details available";
    
    const newsSource = document.createElement("p");
    newsSource.className = "news-source";
    newsSource.textContent = `Source: ${source || "Unknown"}`;
    
    const newsDate = document.createElement("p");
    newsDate.className = "news-date";
    newsDate.textContent = `Published: ${date || "Unknown date"}`;
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(newsImage);
    modalContent.appendChild(newsTitle);
    modalContent.appendChild(newsDetails);
    modalContent.appendChild(newsSource);
    modalContent.appendChild(newsDate);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("modal-fade-out");
            modalContent.classList.add("modal-slide-out");
            modal.addEventListener("animationend", () => modal.remove(), { once: true });
        }
    });
}

// Add animations to quick links
function addNewLink() {
    const modal = document.getElementById("add-link-modal");
    modal.style.display = "block";
    
    // Add animation to modal
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
        modalContent.classList.add("modal-slide-in");
    }
    
    // Clear previous input
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
    document.getElementById("link-icon").selectedIndex = 0;
}

function saveNewLink() {
    const name = document.getElementById("link-name").value.trim();
    const url = document.getElementById("link-url").value.trim();
    const iconClass = document.getElementById("link-icon").value;
    
    if (name && url) {
        // Validate URL
        try {
            new URL(url); // This will throw an error if the URL is invalid
            
            // Create and add the new link with animation
            const linksContainer = document.querySelector(".quick-links-buttons");
            const newLink = document.createElement("a");
            newLink.href = url;
            newLink.target = "_blank";
            newLink.className = "quick-link-btn link-appear";
            
            const icon = document.createElement("i");
            icon.className = `fas ${iconClass}`;
            newLink.appendChild(icon);
            
            // Add title attribute for hover tooltip
            newLink.title = name;
            
            linksContainer.appendChild(newLink);
            
            // Save to localStorage
            saveQuickLinks();
            
            // Close the modal
            closeModal();
        } catch (e) {
            alert("Please enter a valid URL (including http:// or https://)");
        }
    } else {
        alert("Please fill in all fields");
    }
}

function closeModal() {
    const modal = document.getElementById("add-link-modal");
    const modalContent = modal.querySelector(".modal-content");
    
    // Add exit animations
    if (modalContent) {
        modalContent.classList.add("modal-slide-out");
        modal.classList.add("modal-fade-out");
        
        // Wait for animation to complete before hiding
        modalContent.addEventListener("animationend", () => {
            modal.style.display = "none";
            // Reset the animation classes for next time
            modalContent.classList.remove("modal-slide-out");
            modal.classList.remove("modal-fade-out");
        }, { once: true });
    } else {
        modal.style.display = "none";
    }
}

// Load news if the news section exists
if (document.getElementById('news-list')) {
    fetchNews();
}

// Add animations to news items
async function fetchNews() {
    const newsList = document.getElementById("news-list");
    if (!newsList) {
        console.error("News list element not found");
        return;
    }
    
    // Add loading animation
    newsList.innerHTML = "<li class='loading-news'>Loading news<span class='dot-animation'>...</span></li>";
    
    // API key should be stored on the server side in production
    // This is a placeholder key and should be replaced with a proper backend solution
    const apiKey = '1eedbb40c7814f04ae9b3fce323b2c48'; // Replace this with an environment variable or backend fetch
    const url = `https://newsapi.org/v2/everything?q=`;
    
    try {
        // In a production environment, this request should go through your backend
        // to keep the API key secure
        // For now we'll use mock data instead of making a real API call
        // const response = await fetch(url);
        // const data = await response.json();
        
        // Mock data for development purposes
        setTimeout(() => {
            const mockNews = [
                { title: "Tech Breakthrough in AI Development", description: "Scientists announce major advancement in artificial intelligence technology.", source: { name: "Tech News" }, publishedAt: "2025-03-12T14:30:00Z" },
                { title: "New Climate Policy Implemented", description: "Global leaders agree on historic climate change initiatives.", source: { name: "World News" }, publishedAt: "2025-03-13T10:15:00Z" },
                { title: "Medical Research Shows Promise", description: "Novel treatment method shows positive results in clinical trials.", source: { name: "Health Today" }, publishedAt: "2025-03-12T08:45:00Z" }
            ];
            
            // Clear loading animation
            newsList.innerHTML = "";
            
            // Display mock news
            mockNews.forEach((article, index) => {
                let li = document.createElement("li");
                li.classList.add("news-card", "news-item-appear");
                li.style.animationDelay = `${index * 0.15}s`;
                
                const title = document.createElement("strong");
                title.textContent = article.title || "Untitled Article";
                
                li.appendChild(title);
                
                li.onclick = () => {
                    const details = article.description || "No description available.";
                    const source = article.source?.name || "Unknown source";
                    const publishedAt = article.publishedAt ? 
                        new Date(article.publishedAt).toLocaleString() : 
                        "Unknown date";
                    
                    showNewsModal(article.title, details, source, publishedAt);
                };
                
                newsList.appendChild(li);
            });
        }, 1000);
    } catch (error) {
        console.error("Error fetching news:", error);
        newsList.innerHTML = "<li>Failed to load news. Please try again later.</li>";
        
        // Fall back to mock data if the API fails
        setTimeout(() => {
            const mockNews = [
                { title: "API Error: Tech Breakthrough in AI Development", description: "Scientists announce major advancement in artificial intelligence technology." },
                { title: "API Error: New Climate Policy Implemented", description: "Global leaders agree on historic climate change initiatives." },
                { title: "API Error: Medical Research Shows Promise", description: "Novel treatment method shows positive results in clinical trials." }
            ];
            
            newsList.innerHTML = "";
            mockNews.forEach((article, index) => {
                let li = document.createElement("li");
                li.classList.add("news-card", "news-item-appear");
                li.style.animationDelay = `${index * 0.15}s`;
                li.innerHTML = `<strong>${article.title}</strong>`;
                li.onclick = () => showNewsModal(article.title, article.description, "Mock Source", "Unknown date");
                newsList.appendChild(li);
            });
        }, 1000);
    }
}

// New function to show news in a modal
function showNewsModal(title, details, source, date) {
    // Check if a news modal already exists and remove it
    const existingModal = document.getElementById("news-detail-modal");
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create modal
    const modal = document.createElement("div");
    modal.id = "news-detail-modal";
    modal.className = "modal modal-fade-in";
    modal.style.display = "block";
    
    const modalContent = document.createElement("div");
    modalContent.className = "modal-content modal-slide-in";
    
    const closeBtn = document.createElement("span");
    closeBtn.className = "close-modal";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => {
        modal.classList.add("modal-fade-out");
        modalContent.classList.add("modal-slide-out");
        modal.addEventListener("animationend", () => modal.remove(), { once: true });
    };
    
    const newsTitle = document.createElement("h3");
    newsTitle.textContent = title || "No Title";
    
    const newsDetails = document.createElement("p");
    newsDetails.textContent = details || "No details available";
    
    const newsSource = document.createElement("p");
    newsSource.className = "news-source";
    newsSource.textContent = `Source: ${source || "Unknown"}`;
    
    const newsDate = document.createElement("p");
    newsDate.className = "news-date";
    newsDate.textContent = `Published: ${date || "Unknown date"}`;
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(newsTitle);
    modalContent.appendChild(newsDetails);
    modalContent.appendChild(newsSource);
    modalContent.appendChild(newsDate);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal when clicking outside of it
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("modal-fade-out");
            modalContent.classList.add("modal-slide-out");
            modal.addEventListener("animationend", () => modal.remove(), { once: true });
        }
    });
}

// Add animations to quick links
function addNewLink() {
    const modal = document.getElementById("add-link-modal");
    if (!modal) {
        console.error("Modal element not found");
        return;
    }
    
    modal.style.display = "block";
    
    // Add animation to modal
    const modalContent = modal.querySelector(".modal-content");
    if (modalContent) {
        modalContent.classList.add("modal-slide-in");
    }
    
    // Clear previous input
    const linkName = document.getElementById("link-name");
    const linkUrl = document.getElementById("link-url");
    const linkIcon = document.getElementById("link-icon");
    
    if (linkName) linkName.value = "";
    if (linkUrl) linkUrl.value = "";
    if (linkIcon) linkIcon.selectedIndex = 0;
}

function saveNewLink() {
    const nameElement = document.getElementById("link-name");
    const urlElement = document.getElementById("link-url");
    const iconElement = document.getElementById("link-icon");
    
    if (!nameElement || !urlElement || !iconElement) {
        console.error("Form elements not found");
        return;
    }
    
    const name = nameElement.value.trim();
    const url = urlElement.value.trim();
    const iconClass = iconElement.value;
    
    if (name && url) {
        // Validate URL
        try {
            new URL(url); // This will throw an error if the URL is invalid
            
            // Create and add the new link with animation
            const linksContainer = document.querySelector(".quick-links-buttons");
            if (!linksContainer) {
                console.error("Links container not found");
                return;
            }
            
            const newLink = document.createElement("a");
            newLink.href = url;
            newLink.target = "_blank";
            newLink.className = "quick-link-btn link-appear";
            
            const icon = document.createElement("i");
            icon.className = `fas ${iconClass}`;
            newLink.appendChild(icon);
            
            // Add title attribute for hover tooltip
            newLink.title = name;
            
            linksContainer.appendChild(newLink);
            
            // Save to localStorage
            saveQuickLinks();
            
            // Close the modal
            closeModal();
        } catch (e) {
            alert("Please enter a valid URL (including http:// or https://)");
        }
    } else {
        alert("Please fill in all fields");
    }
}

function closeModal() {
    const modal = document.getElementById("add-link-modal");
    if (!modal) {
        console.error("Modal element not found");
        return;
    }
    
    const modalContent = modal.querySelector(".modal-content");
    
    // Add exit animations
    if (modalContent) {
        modalContent.classList.add("modal-slide-out");
        modal.classList.add("modal-fade-out");
        
        // Wait for animation to complete before hiding
        const hideModal = () => {
            modal.style.display = "none";
            // Reset the animation classes for next time
            modalContent.classList.remove("modal-slide-out", "modal-slide-in");
            modal.classList.remove("modal-fade-out", "modal-fade-in");
        };
        
        // Use the once option to ensure the event listener is removed after execution
        modalContent.addEventListener("animationend", hideModal, { once: true });
    } else {
        modal.style.display = "none";
    }
}

function loadQuickLinks() {
    try {
        const savedLinksJSON = localStorage.getItem("quickLinks");
        if (!savedLinksJSON) return;
        // Original functions with animation enhancements
function addTask() {
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    
    if (!taskInput || !taskList) {
        console.error("Task input or list element not found");
        return;
    }

    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        const li = document.createElement("li");
        // Add animation class
        li.classList.add("task-item-appear");

        // Checkbox for completion
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.onclick = () => {
            li.classList.toggle("completed");
            saveTasks();
        };

        // Task Text
        const span = document.createElement("span");
        span.textContent = taskText;

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "❌";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = () => {
            // Add fade-out animation before removing
            li.classList.add("task-item-delete");
            // Use the once option to ensure the event listener is removed after execution
            li.addEventListener("animationend", () => {
                li.remove();
                saveTasks();
            }, { once: true });
        };

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        // Store in localStorage
        saveTasks();

        // Reset Input
        taskInput.value = "";
    }
}

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
        aiAvatar.src = aiAvatar.dataset.animatedSrc || "Clips/LCPT.gif";
        aiAvatar.classList.add("ai-talking");
    }
}


// Initialize the page with static image for AI avatar
document.addEventListener('DOMContentLoaded', () => {
    // Initialize static AI image
    const aiAvatar = document.querySelector(".ai-avatar img");
    if (aiAvatar) {
        // Store the animated GIF path
        aiAvatar.dataset.animatedSrc = aiAvatar.src;
        // Create and set static image path (fallback if image doesn't exist)
        aiAvatar.src = "Images/LCPT-static.png"; 
    }
    
    // Initialize tasks
    loadTasks();
    
    // Initialize quick links
    loadQuickLinks();
    
    // Setup event listener for chat form if it exists
    const chatForm = document.querySelector('form#chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Load news if the news section exists
    if (document.getElementById('news-list')) {
        fetchNews();
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
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main');
    const rightbar = document.querySelector('.rightbar');
    
    if (sidebar) sidebar.classList.add('slide-in-left');
    if (main) main.classList.add('fade-in');
    if (rightbar) rightbar.classList.add('slide-in-right');
    
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

// Improved localStorage functions with error handling
function saveTasks() {
    try {
        const tasks = [];
        document.querySelectorAll("#task-list li").forEach(li => {
            const spanElement = li.querySelector("span");
            if (spanElement) {
                tasks.push({
                    text: spanElement.textContent,
                    completed: li.classList.contains("completed")
                });
            }
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
}

function loadTasks() {
    try {
        const taskList = document.getElementById("task-list");
        if (!taskList) {
            console.error("Task list element not found");
            return;
        }
        
        const savedTasksJSON = localStorage.getItem("tasks");
        if (!savedTasksJSON) {
            console.log("No saved tasks found");
            return;
        }
        
        let savedTasks;
        try {
            savedTasks = JSON.parse(savedTasksJSON);
            if (!Array.isArray(savedTasks)) {
                throw new Error("Saved tasks is not an array");
            }
        } catch (parseError) {
            console.error("Error parsing saved tasks:", parseError);
            return;
        }
        
        taskList.innerHTML = ""; // Clear list before loading
        
        savedTasks.forEach((task, index) => {
            if (!task || typeof task !== 'object' || typeof task.text !== 'string') {
                console.warn("Invalid task data:", task);
                return;
            }
            
            const li = document.createElement("li");
            // Add animation with staggered delay
            li.classList.add("task-item-appear");
            li.style.animationDelay = `${index * 0.1}s`;

            // Checkbox for completion
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = !!task.completed;
            if (task.completed) li.classList.add("completed");
            checkbox.onclick = () => {
                li.classList.toggle("completed");
                saveTasks();
            };

            // Task Text
            const span = document.createElement("span");
            span.textContent = task.text;

            // Delete Button
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.className = "delete-btn";
            deleteBtn.onclick = () => {
                // Add fade-out animation before removing
                li.classList.add("task-item-delete");
                li.addEventListener("animationend", () => {
                    li.remove();
                    saveTasks();
                }, { once: true });
            };

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

function saveQuickLinks() {
    try {
        const links = [];
        const quickLinkButtons = document.querySelectorAll(".quick-links-buttons .quick-link-btn");
        
        quickLinkButtons.forEach(link => {
            // Skip the default links with fab class
            const iconElement = link.querySelector("i");
            if (iconElement && iconElement.classList.contains("fab")) return;
            
            links.push({
                name: link.title || "Unnamed link",
                url: link.href || "#",
                icon: iconElement ? 
                    iconElement.className.replace("fas ", "") : 
                    "fa-link" // Default icon
            });
        });
        
        localStorage.setItem("quickLinks", JSON.stringify(links));
    } catch (error) {
        console.error("Error saving quick links:", error);
    }
}

function loadQuickLinks() {
    try {
        const savedLinksJSON = localStorage.getItem("quickLinks");
        if (!savedLinksJSON) return;
        
        let savedLinks;
        try {
            savedLinks = JSON.parse(savedLinksJSON);
            if (!Array.isArray(savedLinks)) {
                throw new Error("Saved links is not an array");
            }
        } catch (parseError) {
            console.error("Error parsing saved links:", parseError);
            return;
        }
        
        const linksContainer = document.querySelector(".quick-links-buttons");
        if (!linksContainer) {
            console.error("Links container not found");
            return;
        }
        
        savedLinks.forEach((link, index) => {
            if (!link || typeof link !== 'object') {
                console.warn("Invalid link data:", link);
                return;
            }
            
            const newLink = document.createElement("a");
            newLink.href = link.url || "#";
            newLink.target = "_blank";
            newLink.className = "quick-link-btn link-appear";
            newLink.style.animationDelay = `${index * 0.1}s`;
            newLink.title = link.name || "Unnamed link";
            
            const icon = document.createElement("i");
            icon.className = `fas ${link.icon || "fa-link"}`;
            newLink.appendChild(icon);
            
            linksContainer.appendChild(newLink);
        });
    } catch (error) {
        console.error("Error loading quick links:", error);
    }
}
        const savedLinks = JSON.parse(savedLinksJSON);
        const linksContainer = document.querySelector(".quick-links-buttons");
        
        savedLinks.forEach((link, index) => {
            const newLink = document.createElement("a");
            newLink.href = link.url;
            newLink.target = "_blank";
            newLink.className = "quick-link-btn link-appear";
            newLink.style.animationDelay = `${index * 0.1}s`;
            newLink.title = link.name;
            
            const icon = document.createElement("i");
            icon.className = `fas ${link.icon}`;
            newLink.appendChild(icon);
            
            linksContainer.appendChild(newLink);
        });
    } catch (error) {
        console.error("Error loading quick links:", error);
    }
}
