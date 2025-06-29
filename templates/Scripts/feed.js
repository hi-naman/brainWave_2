// Function to sign out the user
function handleFirebaseSignOut() {
    auth.signOut().then(() => {
        console.log("User signed out");
        alert("Signed out successfully!");
        window.location.reload(); // Refresh page after sign-out
    }).catch(error => {
        console.error("Sign-out error:", error);
    });
}

// NewsAPI configuration
const NEWS_API_KEY = '1eedbb40c7814f04ae9b3fce323b2c48';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/top-headlines';
const RESEARCH_NEWS_API_URL = 'https://newsapi.org/v2/everything';

// News categories for daily news
const NEWS_CATEGORIES = [
    'technology', 'business', 'entertainment', 'science', 'health'
];

// Research news domains
const RESEARCH_DOMAINS = [
    'nature.com', 
    'science.org', 
    'pnas.org', 
    'cell.com', 
    'sciencedirect.com'
];

// Caching configuration
const NEWS_CACHE_KEY = 'brainwave-news-cache';
const CACHE_EXPIRATION_HOURS = 1; // Cache news for 2 hours


// Error types
const ERROR_TYPES = {
    NETWORK_ERROR: 'Network Error',
    API_LIMIT_REACHED: 'API Limit Reached',
    NO_RESULTS: 'No Results Found',
    UNKNOWN_ERROR: 'Unknown Error'
};

// Create loading indicator
function createLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'news-loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner-circle"></div>
            <p>Fetching latest news...</p>
        </div>
    `;
    return loadingIndicator;
}

// Detailed error handling
function handleNewsError(error, newsList, type, category) {
    console.error('News Fetch Error:', error);
    
    let errorType = ERROR_TYPES.UNKNOWN_ERROR;
    let errorMessage = 'An unexpected error occurred.';
    
    // Classify error types
    if (error.message.includes('Failed to fetch')) {
        errorType = ERROR_TYPES.NETWORK_ERROR;
        errorMessage = 'Unable to connect to the news server. Please check your internet connection.';
    } else if (error.message.includes('429')) {
        errorType = ERROR_TYPES.API_LIMIT_REACHED;
        errorMessage = 'News API limit reached. Please try again later.';
    }
    
    // Try to retrieve cached data
    const cachedData = getNewsFromCache(type, category);
    
    // Create error display
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'news-error-display';
    
    if (cachedData) {
        errorDisplay.innerHTML = `
            <div class="error-header error-warning">
                <h3>${errorType}</h3>
                <p>${errorMessage}</p>
            </div>
            <div class="error-subtext">
                <p>Showing cached news from ${new Date(getCacheTimestamp()).toLocaleString()}</p>
            </div>
        `;
        
        // Clear previous content
        newsList.innerHTML = '';
        newsList.appendChild(errorDisplay);
        
        // Display cached articles
        displayNews(cachedData, 
            document.getElementById('template-news-card'), 
            newsList
        );
    } else {
        errorDisplay.innerHTML = `
            <div class="error-header error-critical">
                <h3>${errorType}</h3>
                <p>${errorMessage}</p>
            </div>
            <div class="error-actions">
                <button onclick="fetchNews('${type}', '${category}')">Retry</button>
                <button onclick="showManualRefreshOptions()">Manual Refresh</button>
            </div>
        `;
        
        // Clear previous content
        newsList.innerHTML = '';
        newsList.appendChild(errorDisplay);
    }
}

// Get cache timestamp
function getCacheTimestamp() {
    const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
    if (cachedData) {
        try {
            const parsedCache = JSON.parse(cachedData);
            return parsedCache.timestamp;
        } catch (error) {
            console.error('Error parsing cache timestamp:', error);
            return Date.now();
        }
    }
    return Date.now();
}

// Show manual refresh options
function showManualRefreshOptions() {
    const newsList = document.getElementById('news-list');
    const manualRefreshDisplay = document.createElement('div');
    manualRefreshDisplay.className = 'manual-refresh-options';
    manualRefreshDisplay.innerHTML = `
        <div class="manual-refresh-header">
            <h3>Manual News Refresh</h3>
            <p>Choose how you want to refresh news:</p>
        </div>
        <div class="refresh-buttons">
            <button onclick="clearNewsCache(); fetchNews('daily', 'technology')">
                Force Refresh (Daily Technology)
            </button>
            <button onclick="clearNewsCache(); fetchNews('research')">
                Force Refresh (Research)
            </button>
            <button onclick="resetNewsView()">
                Reset View
            </button>
        </div>
    `;
    
    // Clear previous content
    newsList.innerHTML = '';
    newsList.appendChild(manualRefreshDisplay);
}

// Reset news view to default
function resetNewsView() {
    clearNewsCache();
    fetchNews('daily', 'technology');
}


function createNewsCache(articles, type, category) {
    const cacheEntry = {
        timestamp: Date.now(),
        type: type,
        category: category,
        articles: articles
    };
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(cacheEntry));
}

function getNewsFromCache(type, category) {
    const cachedData = localStorage.getItem(NEWS_CACHE_KEY);
    if (!cachedData) return null;

    try {
        const parsedCache = JSON.parse(cachedData);
        
        // Check if cache is still valid
        const currentTime = Date.now();
        const cacheAge = (currentTime - parsedCache.timestamp) / (1000 * 60 * 60); // Convert to hours
        
        // Check if cache matches current request and is not expired
        if (cacheAge <= CACHE_EXPIRATION_HOURS && 
            parsedCache.type === type && 
            parsedCache.category === category) {
            return parsedCache.articles;
        }
    } catch (error) {
        console.error('Error parsing news cache:', error);
    }
    
    return null;
}

async function fetchNews(type = 'daily', category = 'technology') {
    const newsList = document.getElementById('news-list');
    const newsTemplate = document.getElementById('template-news-card');
    
    // Clear previous news
    newsList.innerHTML = '';
    
    try {
        // First, check cache
        const cachedArticles = getNewsFromCache(type, category);
        if (cachedArticles) {
            
            displayNews(cachedArticles, newsTemplate, newsList);
            return;
        }

        let url, params;
        
        if (type === 'daily') {
            // Fetch daily news by category
            url = NEWS_API_BASE_URL;
            params = new URLSearchParams({
                category: category,
                country: 'us',
                apiKey: NEWS_API_KEY
            });
        } else {
            // Fetch research news
            url = RESEARCH_NEWS_API_URL;
            params = new URLSearchParams({
                domains: RESEARCH_DOMAINS.join(','),
                sortBy: 'publishedAt',
                apiKey: NEWS_API_KEY
            });
        }
        
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();
        
        if (data.articles) {
            // Cache the fetched articles
            createNewsCache(data.articles, type, category);
            
            // Display news
            displayNews(data.articles, newsTemplate, newsList);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Check if there's a stale cache we can use
        const staleCache = localStorage.getItem(NEWS_CACHE_KEY);
        if (staleCache) {
            try {
                const parsedStaleCache = JSON.parse(staleCache);
                newsList.innerHTML = `
                    <div class="cache-warning">
                        <p>Unable to fetch new articles. Showing cached news from ${new Date(parsedStaleCache.timestamp).toLocaleString()}.</p>
                    </div>
                `;
                displayNews(parsedStaleCache.articles, newsTemplate, newsList);
            } catch (parseError) {
                newsList.innerHTML = `<p>Unable to fetch news. ${error.message}</p>`;
            }
        } else {
            newsList.innerHTML = `<p>Unable to fetch news. ${error.message}</p>`;
        }
    }
}

function displayNews(articles, newsTemplate, newsList) {
    articles.slice(0, 10).forEach(article => {
        // Clone the template
        const newsCard = newsTemplate.content.cloneNode(true);
        
        // Set title
        const titleElement = newsCard.querySelector('#news-title');
        titleElement.textContent = article.title;
        
        // Set source
        const sourceElement = newsCard.querySelector('#news-source');
        sourceElement.textContent = article.source.name;
        
        // // Optional: Add image if available
        // const headerElement = newsCard.querySelector('.card-header');
        // if (article.urlToImage) {
        //     const img = document.createElement('img');
        //     img.src = article.urlToImage;
        //     img.alt = article.title;
        //     headerElement.appendChild(img);
        // }
        
        // Add click event to open article
        const cardElement = newsCard.querySelector('.card');
        cardElement.addEventListener('click', () => {
            window.open(article.url, '_blank');
        });
        
        // Append to news list
        newsList.appendChild(newsCard);
    });
}

// Clear news cache function (useful for manual refresh)
function clearNewsCache() {
    localStorage.removeItem(NEWS_CACHE_KEY);
    console.log('News cache cleared');
}

// Initialize news toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const newsToggle = document.getElementById('news-toggle');
    const newsCategories = document.createElement('div');
    newsCategories.className = 'news-category-buttons';
    
    // Daily news category buttons
    NEWS_CATEGORIES.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        button.onclick = () => fetchNews('daily', category);
        newsCategories.appendChild(button);
    });
    
    const feedSection = document.querySelector('.feed');
    feedSection.insertBefore(newsCategories, document.getElementById('news-list'));
    
    // Toggle between daily and research news
    newsToggle.addEventListener('change', (e) => {
        const newsType = e.target.checked ? 'research' : 'daily';
        newsCategories.style.display = newsType === 'daily' ? 'block' : 'none';
        fetchNews(newsType);
    });
    
    // Initial news fetch
    fetchNews('daily', 'technology');
});

// Optional: Add a manual refresh button
function addNewsRefreshButton() {
    const refreshButton = document.createElement('button');
    refreshButton.textContent = 'Refresh News';
    refreshButton.onclick = () => {
        clearNewsCache();
        fetchNews(
            document.getElementById('news-toggle').checked ? 'research' : 'daily', 
            'technology'
        );
    };
    
    const feedSection = document.querySelector('.feed');
    feedSection.insertBefore(refreshButton, document.getElementById('news-list'));
}

// Call this if you want to add a manual refresh option
addNewsRefreshButton();






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

// New function to display news with expanded view and dislike feature
function displayNews(articles, newsTemplate, newsList) {
    articles.slice(0, 10).forEach((article, index) => {
        // Clone the template
        const newsCard = newsTemplate.content.cloneNode(true);
        
        // Set unique ID for each card
        const cardElement = newsCard.querySelector('.card');
        const cardId = `news-card-${index}`;
        cardElement.id = cardId;
        cardElement.dataset.articleIndex = index;
        
        // Set title
        const titleElement = newsCard.querySelector('#news-title');
        titleElement.textContent = article.title;
        
        // Set source
        const sourceElement = newsCard.querySelector('#news-source');
        sourceElement.textContent = article.source.name;
        
        // Add click event to open expanded view
        cardElement.addEventListener('click', () => {
            showExpandedNewsView(article, cardId);
        });
        
        // Append to news list
        newsList.appendChild(newsCard);
    });
    
    // Store articles in window object for later access
    window.currentNewsArticles = articles;
}

// Function to create and show the expanded news view
function showExpandedNewsView(article, sourceCardId) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.id = 'news-expanded-view';
    
    // Format publication date
    const publishedDate = article.publishedAt ? new Date(article.publishedAt) : new Date();
    const formattedDate = publishedDate.toLocaleString();
    
    // Create modal content
    modal.innerHTML = `
        <div class="news-modal-content">
            <div class="news-modal-header">
                <h2>${article.title}</h2>
                <div class="news-modal-controls">
                    <button class="dislike-btn" title="Dislike and remove">
                        <i class="fas fa-thumbs-down"></i>
                    </button>
                    <button class="close-modal-btn" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            
            <div class="news-modal-body">
                ${article.urlToImage ? 
                    `<div class="news-image-container">
                        <img src="${article.urlToImage}" alt="${article.title}" 
                            onerror="this.onerror=null; this.src='Images/news-placeholder.png';">
                    </div>` : 
                    ''
                }
                
                <div class="news-metadata">
                    <span class="news-source"><i class="fas fa-newspaper"></i> ${article.source.name}</span>
                    <span class="news-date"><i class="far fa-clock"></i> ${formattedDate}</span>
                </div>
                
                <div class="news-content">
                    <p class="news-description">${article.description || 'No description available.'}</p>
                    <p class="news-text">${article.content || article.description || 'No content available.'}</p>
                    <a href="${article.url}" class="read-more-btn" target="_blank">Read Full Article</a>
                </div>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.appendChild(modal);
    
    // Add blur to main content
    document.getElementById('main-page').classList.add('blur-background');
    
    // Animate modal appearance
    setTimeout(() => {
        modal.classList.add('show-modal');
    }, 10);
    
    // Add event listener to close button
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => {
        closeExpandedNewsView();
    });
    
    // Add event listener to dislike button
    const dislikeBtn = modal.querySelector('.dislike-btn');
    dislikeBtn.addEventListener('click', () => {
        dislikeNews(sourceCardId);
        closeExpandedNewsView();
    });
    
    // Close on click outside the content
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeExpandedNewsView();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', handleEscapeKey);
}

// Function to handle escape key press
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeExpandedNewsView();
    }
}

// Function to close the expanded view
function closeExpandedNewsView() {
    const modal = document.getElementById('news-expanded-view');
    if (modal) {
        // Remove escape key listener
        document.removeEventListener('keydown', handleEscapeKey);
        
        // Animate modal disappearance
        modal.classList.remove('show-modal');
        modal.classList.add('hide-modal');
        
        // Remove blur from main content
        document.getElementById('main-page').classList.remove('blur-background');
        
        // Remove modal after animation completes
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Function to handle disliking and removing news
function dislikeNews(cardId) {
    // Get the card element
    const card = document.getElementById(cardId);
    if (!card) return;
    
    // Get index from dataset
    const articleIndex = parseInt(card.dataset.articleIndex);
    
    // Store disliked article in localStorage
    storeDislikedArticle(window.currentNewsArticles[articleIndex]);
    
    // Add fade-out animation
    card.classList.add('card-fade-out');
    
    // Remove the card after animation completes
    card.addEventListener('animationend', () => {
        card.remove();
    }, { once: true });
}

// Function to store disliked articles
function storeDislikedArticle(article) {
    try {
        // Get existing disliked articles
        const dislikedArticlesJSON = localStorage.getItem('disliked-news') || '[]';
        const dislikedArticles = JSON.parse(dislikedArticlesJSON);
        
        // Add current article to disliked list (use title as unique identifier)
        dislikedArticles.push({
            title: article.title,
            source: article.source.name,
            timestamp: Date.now()
        });
        
        // Only keep the most recent 50 disliked articles
        if (dislikedArticles.length > 50) {
            dislikedArticles.shift();
        }
        
        // Save back to localStorage
        localStorage.setItem('disliked-news', JSON.stringify(dislikedArticles));
    } catch (error) {
        console.error('Error storing disliked article:', error);
    }
}

// Modified fetchNews function to filter out disliked articles
async function fetchNews(type = 'daily', category = 'technology') {
    const newsList = document.getElementById('news-list');
    const newsTemplate = document.getElementById('template-news-card');
    
    // Clear previous news
    newsList.innerHTML = '';
    
    // Show loading indicator
    const loadingIndicator = createLoadingIndicator();
    newsList.appendChild(loadingIndicator);
    
    try {
        // First, check cache
        const cachedArticles = getNewsFromCache(type, category);
        if (cachedArticles) {
            // Remove loading indicator
            loadingIndicator.remove();
            
            // Filter out disliked articles
            const filteredArticles = filterDislikedArticles(cachedArticles);
            
            // Display news
            displayNews(filteredArticles, newsTemplate, newsList);
            return;
        }

        let url, params;
        
        if (type === 'daily') {
            // Fetch daily news by category
            url = NEWS_API_BASE_URL;
            params = new URLSearchParams({
                category: category,
                country: 'us',
                apiKey: NEWS_API_KEY
            });
        } else {
            // Fetch research news
            url = RESEARCH_NEWS_API_URL;
            params = new URLSearchParams({
                domains: RESEARCH_DOMAINS.join(','),
                sortBy: 'publishedAt',
                apiKey: NEWS_API_KEY
            });
        }
        
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();
        
        if (data.articles) {
            // Remove loading indicator
            loadingIndicator.remove();
            
            // Cache the fetched articles
            createNewsCache(data.articles, type, category);
            
            // Filter out disliked articles
            const filteredArticles = filterDislikedArticles(data.articles);
            
            // Display news
            displayNews(filteredArticles, newsTemplate, newsList);
        }
    } catch (error) {
        // Remove loading indicator
        loadingIndicator.remove();
        
        console.error('Error fetching news:', error);
        handleNewsError(error, newsList, type, category);
    }
}

// Function to filter out disliked articles
function filterDislikedArticles(articles) {
    try {
        // Get existing disliked articles
        const dislikedArticlesJSON = localStorage.getItem('disliked-news') || '[]';
        const dislikedArticles = JSON.parse(dislikedArticlesJSON);
        
        // Create a set of disliked titles for faster lookup
        const dislikedTitles = new Set(dislikedArticles.map(item => item.title));
        
        // Filter out articles with matching titles
        return articles.filter(article => !dislikedTitles.has(article.title));
    } catch (error) {
        console.error('Error filtering disliked articles:', error);
        return articles;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
});

