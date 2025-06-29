// Enhanced Firebase Google Sign-In handler
function handleFirebaseGoogleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    // Add any additional scopes you need
    provider.addScope('profile');
    provider.addScope('email');
    
    auth.signInWithPopup(provider)
        .then((result) => {
            // This gives you a Google Access Token
            const credential = result.credential;
            const token = credential.accessToken;
            
            // The signed-in user info
            const user = result.user;
            
            // Update UI with user info
            updateUserProfile(user);
            
            // Hide login page and show main page
            toggleLoginVisibility(false);
            
            // Store user data in session
            storeUserSession(user);
            
            // NEW CODE: Call the data extraction endpoint
            fetch('/extract-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Data extraction started:', data);
                // Optionally show a notification to user
                showNotification('Background data sync started');
            })
            .catch(error => {
                console.error('Error starting data extraction:', error);
            });
        })
        .catch((error) => {
            console.error("Google Sign-In Error:", error);
            handleSignInError(error);
        });
}

function updateUserProfile(user) {
    const profilePicture = user.photoURL || "Images/avatar.png";
    const userName = user.displayName || "User";
    const userEmail = user.email || "user@example.com";

    document.getElementById("profile-picture").src = profilePicture;
    document.getElementById("profile-name").textContent = userName;
    document.getElementById("profile-email").textContent = userEmail;
}

function toggleLoginVisibility(isLoginVisible) {
    const loginPage = document.getElementById("login-page");
    const mainPage = document.getElementById("main-page");
    
    if (loginPage) loginPage.style.display = isLoginVisible ? "block" : "none";
    if (mainPage) mainPage.style.display = isLoginVisible ? "none" : "flex";
}

function storeUserSession(user) {
    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("userName", user.displayName || "User");
    sessionStorage.setItem("userEmail", user.email || "user@example.com");
    sessionStorage.setItem("userPicture", user.photoURL || "Images/avatar.png");
}

function handleSignInError(error) {
    const errorEl = document.getElementById("google-sign-in-error");
    
    // Handle different error cases
    let errorMessage = "Sign-in failed. Please try again.";
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            errorMessage = "Sign-in popup was closed before completing.";
            break;
        case 'auth/cancelled-popup-request':
            errorMessage = "Only one sign-in popup allowed at a time.";
            break;
        case 'auth/account-exists-with-different-credential':
            errorMessage = "An account already exists with this email.";
            break;
    }
    
    if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.style.display = "block";
    }
    
    // Optional: fallback to manual sign-in
    toggleSignInMethod();
}

// Helper function to show notifications
function showNotification(message) {
    // Create a simple notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Check auth state on page load
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            updateUserProfile(user);
            toggleLoginVisibility(false);
            storeUserSession(user);
        } else {
            // User is signed out
            toggleLoginVisibility(true);
        }
    });
}

// Initialize when DOM is loaded
window.addEventListener('load', function() {
    checkAuthState();
    
    // Initialize manual sign-in form
    const manualForm = document.getElementById("manual-sign-in-form");
    if (manualForm) {
        manualForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleManualSignIn();
        });
    }
});
function developerBypass() {
    // Create a mock Firebase user object
    const mockUser = {
        displayName: "Developer",
        email: "developer@brainwave.com",
        photoURL: "Images/avatar.png"
    };
    
    // Update the profile section
    updateUserProfile(mockUser);
    
    // Hide login page and show main page
    toggleLoginVisibility(false);
    
    // Save login state to session storage
    storeUserSession(mockUser);
    
    console.log("Developer bypass activated. Logged in as:", mockUser.displayName);
}
function signOut() {
    auth.signOut().then(() => {
        // Clear session storage
        sessionStorage.clear();
        
        // Show login page and hide main page
        toggleLoginVisibility(true);
        
        // Reset profile info
        document.getElementById("profile-picture").src = "Images/avatar.png";
        document.getElementById("profile-name").textContent = "USER NAME";
        document.getElementById("profile-email").textContent = "user@example.com";
    }).catch((error) => {
        console.error("Sign out error:", error);
    });
}

