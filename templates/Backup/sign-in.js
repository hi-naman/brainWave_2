// Enhance the existing Google Sign-In handler
function handleGoogleSignIn(response) {
    try {
        // More robust error checking
        if (!response || !response.credential) {
            throw new Error("Invalid Google Sign-In response");
        }

        const user = parseJwt(response.credential);
        
        // More robust null/undefined checking
        const profilePicture = user.picture || "Images/avatar.png";
        const userName = user.name || "User";
        const userEmail = user.email || "user@example.com";

        // Update profile elements with fallback values
        const profilePictureEl = document.getElementById("profile-picture");
        const profileNameEl = document.getElementById("profile-name");
        const profileEmailEl = document.getElementById("profile-email");

        if (profilePictureEl) profilePictureEl.src = profilePicture;
        if (profileNameEl) profileNameEl.textContent = userName;
        if (profileEmailEl) profileEmailEl.textContent = userEmail;

        // Hide login page and show main page
        const loginPage = document.getElementById("login-page");
        const mainPage = document.getElementById("main-page");
        
        if (loginPage) loginPage.style.display = "none";
        if (mainPage) mainPage.style.display = "flex";

        // More secure session storage
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("userName", userName);
        sessionStorage.setItem("userEmail", userEmail);
        sessionStorage.setItem("userPicture", profilePicture);

    } catch (error) {
        console.error("Google Sign-In Error:", error);
        
        // Show error message to user
        const errorEl = document.getElementById("google-sign-in-error");
        if (errorEl) {
            errorEl.textContent = "Sign-in failed. Please try again.";
            errorEl.style.display = "block";
        }
        
        // Optional: fallback to manual sign-in
        toggleSignInMethod();
    }
}

// Manual sign-in handler
function handleManualSignIn() {
    const nameInput = document.getElementById("manual-name");
    const emailInput = document.getElementById("manual-email");
    const profilePicInput = document.getElementById("manual-profile-pic");
    
    // Enhanced validation
    if (!nameInput || !emailInput) {
        console.error("Login form elements not found");
        alert("An error occurred with the login form.");
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const profilePic = profilePicInput.value.trim() || "Images/avatar.png";

    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Rest of the function remains the same...
}

// Toggle between Google and Manual sign-in forms
function toggleSignInMethod() {
    const googleSignIn = document.getElementById("google-sign-in");
    const manualSignIn = document.getElementById("manual-sign-in");
    const toggleLink = document.getElementById("toggle-sign-in");
    
    if (googleSignIn.style.display === "none") {
        googleSignIn.style.display = "block";
        manualSignIn.style.display = "none";
        toggleLink.textContent = "Use manual sign-in instead";
    } else {
        googleSignIn.style.display = "none";
        manualSignIn.style.display = "block";
        toggleLink.textContent = "Use Google sign-in instead";
    }
}

// Enhanced window load event handler with better error checking
window.addEventListener('load', function() {
    // Check if already logged in
    if (sessionStorage.getItem("loggedIn") === "true") {
        console.log("Session detected: Auto-login enabled");
        
        // Get stored user info
        const userName = sessionStorage.getItem("userName") || "User";
        const userEmail = sessionStorage.getItem("userEmail") || "user@example.com";
        const userPicture = sessionStorage.getItem("userPicture") || "Images/avatar.png";
        
        // Update profile
        document.getElementById("profile-picture").src = userPicture;
        document.getElementById("profile-name").textContent = userName;
        document.getElementById("profile-email").textContent = userEmail;
        
        // Show main page
        document.getElementById("login-page").style.display = "none";
        document.getElementById("main-page").style.display = "flex";
    }
    
    // Enhanced error handling for Google Sign-In initialization
    window.addEventListener('error', function(event) {
        if (event.target.src && event.target.src.includes('accounts.google.com')) {
            console.error("Google Sign-In script failed to load");
            
            // Show manual sign-in as a fallback
            const googleSignIn = document.getElementById("google-sign-in");
            const manualSignIn = document.getElementById("manual-sign-in");
            const toggleLink = document.getElementById("toggle-sign-in");
            
            if (googleSignIn && manualSignIn && toggleLink) {
                googleSignIn.style.display = "none";
                manualSignIn.style.display = "block";
                toggleLink.textContent = "Try Google sign-in again";
                
                // Add an error message
                const errorMessage = document.createElement('p');
                errorMessage.className = "sign-in-error";
                errorMessage.textContent = "Google Sign-In is currently unavailable. Please use manual sign-in.";
                errorMessage.style.color = "#f44336";
                manualSignIn.insertBefore(errorMessage, manualSignIn.firstChild);
            }
        }
    }, true);
    
    // Initialize the manual sign-in form if it exists
    const manualForm = document.getElementById("manual-sign-in-form");
    if (manualForm) {
        manualForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleManualSignIn();
        });
    }
});

// Function to decode JWT token
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(jsonPayload);
}


// Developer Bypass Function
function developerBypass() {
    // Set default user info for bypass
    const defaultUser = {
        name: "Developer",
        email: "developer@brainwave.com",
        picture: "Images/avatar.png"
    };

    // Update the profile section with default user info
    document.getElementById("profile-picture").src = defaultUser.picture;
    document.getElementById("profile-name").textContent = defaultUser.name;
    document.getElementById("profile-email").textContent = defaultUser.email;

    // Hide the login page and show the main page
    document.getElementById("login-page").style.display = "none";
    document.getElementById("main-page").style.display = "flex";

    // Save login state to session storage
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("userName", defaultUser.name);
    sessionStorage.setItem("userEmail", defaultUser.email);
    sessionStorage.setItem("userPicture", defaultUser.picture);

    console.log("Developer bypass activated. Logged in as:", defaultUser.name);
}